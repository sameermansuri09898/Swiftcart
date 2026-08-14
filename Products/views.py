from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import AllowAny,IsAuthenticated
from channels.layers import get_channel_layer

from rest_framework import status
from rest_framework.views import APIView
from .models import Categorys,Products,BulkImport
from .productserializer import ProductSerializer,CategorySerializer
import cloudinary

from .tasks import bulk_create_products
from rest_framework.generics import ListAPIView
from django.core.cache import cache
from .services.Productfilters import ProductFilter
from django_filters.rest_framework import DjangoFilterBackend

from .services.Pagination import ProductPagination


class BulkProductUploadView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def post(self, request):

        csv_file = request.FILES.get(
            "file"
        )

        category_id = request.data.get(
            "category_id",
            3
        )

        # -------------------------
        # File validation
        # -------------------------

        if not csv_file:

            return Response(
                {
                    "error":
                    "CSV file is required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not csv_file.name.lower().endswith(
            ".csv"
        ):

            return Response(
                {
                    "error":
                    "Only CSV files are allowed"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------
        # File size validation
        # Example: 20 MB
        # -------------------------

        max_size = 20 * 1024 * 1024

        if csv_file.size > max_size:

            return Response(
                {
                    "error":
                    "CSV file must be less than 20 MB"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------
        # Category validation
        # -------------------------

        try:

            category = Categorys.objects.get(
                id=category_id
            )

        except Categorys.DoesNotExist:

            return Response(
                {
                    "error":
                    "Category does not exist"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            # -------------------------
            # Upload CSV to Cloudinary
            # -------------------------

            result = cloudinary.uploader.upload(
                csv_file,
                resource_type="raw",
                folder="swiftcart/csv"
            )

            # -------------------------
            # Create import record
            # -------------------------

            bulk_import = BulkImport.objects.create(

                uploaded_by=request.user,

                category=category,

                csv_url=result[
                    "secure_url"
                ],

                cloudinary_public_id=result[
                    "public_id"
                ]
            )

            # -------------------------
            # Start Celery
            # -------------------------

            task = bulk_create_products.delay(
                bulk_import.id
            )

            # Save task ID
            bulk_import.task_id = task.id

            bulk_import.save(
                update_fields=[
                    "task_id"
                ]
            )

            return Response(
                {
                    "message":
                    "Bulk import started",

                    "import_id":
                    bulk_import.id,

                    "task_id":
                    task.id,

                    "status":
                    bulk_import.status
                },
                status=status.HTTP_202_ACCEPTED
            )

        except Exception as error:

            return Response(
                {
                    "error": str(error)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class categoryViews(ListAPIView):
    queryset = Categorys.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class ProductListView(ListAPIView):
    serializer_class = ProductSerializer
    permission_classes =[AllowAny]

    pagination_class = ProductPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = ProductFilter

    def get_queryset(self):
        return(
            Products.objects.select_related("category")
            .filter(is_available = True)
            .order_by(
                "-created_at",
                "-id"
            )
        )

  