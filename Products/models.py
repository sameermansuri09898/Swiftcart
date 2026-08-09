from django.db import models
from django.conf import settings

class Categorys(models.Model):
  name = models.CharField(max_length=120)

  def __str__(self):
    return f"{self.name}"

class Products(models.Model):
  user = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
  Category = models.ForeignKey(Categorys,on_delete=models.CASCADE)
  name = models.CharField(max_length=200)
  brand = models.CharField(max_length=100)
  smallImage = models.ImageField(upload_to='small_Image')
  mediumImage = models.ImageField(upload_to='medium_image')
  largeImage = models.ImageField(upload_to='large_image')
  stock = models.PositiveIntegerField(default=0)
  Price = models.DecimalField(max_digits=10,decimal_places=2)
  offer = models.DecimalField(max_digits=10,decimal_places=2)
  is_available = models.BooleanField(default=True)

  def save(self, *args, **kwargs):
        if self.stock <=0:
            self.is_available = False
        super().save(*args, **kwargs)

  def final_price(self):
        return self.price - (self.price * self.offer / 100)

  def offer_price(self):
        return  self.price - self.final_price() 






  def __str__(self):
    return f"{self.name}{self.brand}"


