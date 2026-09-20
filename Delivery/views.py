from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from .models import DeliveryPartner, PartnerDocuments, PartnerLocation, DeliveryAssignment, RiderEarning
from .serializer import (
    PartnerDocumentsSerializer,
    PartnerLocationSerializer,
    DeliveryPartnerSerializer,
    DeliveryAssignmentSerializer,
    RiderEarningSerializer
)
from rest_framework import generics
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.authentication import JWTAuthentication
from .utils import generate_partner_id
from Account.tasks import Partner_Join_With_Us


class DeliveryPartnerProfileView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]  # Add your authentication classes here
    parser_classes = [MultiPartParser, FormParser]  # Image upload handle karne ke liye

    def get(self, request):
        """Current logged-in rider ka dashboard data fetch karein."""
        partner = get_object_or_404(DeliveryPartner, user=request.user)
        serializer = DeliveryPartnerSerializer(partner)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        """Rider profile details partial update karein."""
        partner = get_object_or_404(DeliveryPartner, user=request.user)
        serializer = DeliveryPartnerSerializer(partner, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeliveryPartnerRegistrationView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        user = request.user
        if hasattr(user, 'delivery_partner'):
            return Response({"message": "You are already registered as a delivery partner."}, status=status.HTTP_400_BAD_REQUEST)

        # Generate unique Partner ID
        partner_id = generate_partner_id()
        Partner_Join_With_Us.delay(user.email, partner_id)  # Celery task to send email easily
    
        serializer = DeliveryPartnerSerializer(data= request.data)
        if serializer.is_valid():
            serializer.save(user=user, Partner_id=partner_id)
            return Response({
                "message": "Delivery partner registered successfully.",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ToggleOnlineStatusView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        """Rider ko Online/Offline aur Availability set karne ke liye."""
        partner = get_object_or_404(DeliveryPartner, user=request.user)
        
        is_online = request.data.get("is_online", not partner.is_online)
        partner.is_online = is_online
        
        # Agar rider offline jaye toh unavailable automatically set ho jaye
        if not is_online:
            partner.is_available = False
        else:
            partner.is_available = request.data.get("is_available", True)

        partner.save()

        return Response({
            "message": "Status updated successfully.",
            "is_online": partner.is_online,
            "is_available": partner.is_available
        }, status=status.HTTP_200_OK)   
    
# 2. Partner Document Upload & Verification here
# ---------------------------------------------------------------------
class PartnerDocumentUploadView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    parser_classes = [MultiPartParser, FormParser] 

    def get(self, request):
        """Uploaded documents ka status check karein."""
        partner = get_object_or_404(DeliveryPartner, user=request.user)
        documents = getattr(partner, 'partner_document', None)
        if not documents:
            return Response({"message": "No documents uploaded yet."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = PartnerDocumentsSerializer(documents)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Documents upload ya update (DL, RC, Aadhar) karein."""
        partner = get_object_or_404(DeliveryPartner, user=request.user)
        documents, created = PartnerDocuments.objects.get_or_create(partner=partner)

        serializer = PartnerDocumentsSerializer(documents, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Documents uploaded successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# delivery partner store live location update for calculation of distance and delivery assignment
class PartnerLocationUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        """Rider ke current location ko update karein."""
        partner = get_object_or_404(DeliveryPartner, user=request.user)
        latitude = request.data.get("latitude")
        longitude = request.data.get("longitude")

        if latitude is None or longitude is None:
            return Response(
                {"error": "Both latitude and longitude are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        location_obj, created = PartnerLocation.objects.update_or_create(
            rider=partner,
            defaults={"latitude": latitude, "longitude": longitude}
        )

        serializer = PartnerLocationSerializer(location_obj)
        return Response({
            "message": "Location updated successfully.",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

