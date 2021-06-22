from django.urls import path, include
from rest_framework_nested import routers

from django.views.generic import TemplateView
from . import views
# from .api import views as api_views

# router = routers.SimpleRouter()
# router.register('ms-assoc-table', api_views.MsAssocTableViewSet, 'accounts-ms-assoc-table-viewset')
# router.register('rel-mgr-align', api_views.RelMgrAlignViewSet, 'accounts-rel-mgr-align-table-viewset')

urlpatterns = [
    path(
        'tests/api-to-table',
        TemplateView.as_view(template_name="utils/tests/api-to-table.html"),
    ),
    
]