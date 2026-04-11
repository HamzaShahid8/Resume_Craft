from django.shortcuts import render
from .models import *
from accounts.models import *
from rest_framework import viewsets, status
from .serializers import *
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse
from xhtml2pdf import pisa
from rest_framework.views import APIView
from django.template.loader import render_to_string

"""
GET LIST: {baseUrl}/resumes
Output: {
    success: boolean
    message: string
    data: Record<string, any>
}

GET Single: {baseUrl}/resumes/:resumeId
GET Dropdown data: {baseUrl}/resumes/dropdown-data
POST Create: {baseUrl}/resumes
PUT Update (All Fields): {baseUrl}/resumes/:resumeId
PATCH Update (Partial Update): {baseUrl}/resumes/:resumeId
DELETE: {baseUrl}/resumes/:resumeId

"""



# Create your views here.
class ResumeViewSet(viewsets.ModelViewSet):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated]
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['user', 'title', 'created_at', 'updated_at']
    search_fields = ['title', 'user__username']
    ordering_fields = ['created_at', 'updated_at', 'title']
    ordering = ['-created_at'] # default ordering
    
    
    def get_queryset(self):
        
        user = self.request.user
        
        return Resume.objects.filter(user=user)
    
    def get_permissions(self):
        
        user = self.request.user
        
        if self.action in ['create', 'update', 'partial_update', 'retrieve', 'destroy']:
            return [IsAuthenticated()]
        
        return [IsAuthenticated()]
    
        
    def create(self, request, *args, **kwargs):
        data = request.data

        # Bulk create
        if isinstance(data, list):
            created_items = []
            for item in data:
                personal_data = item.pop('personal', None)
                education_data = item.pop('education', [])
                experience_data = item.pop('experience', [])
                skills_data = item.pop('skills', [])

                # Parent resume
                resume = Resume.objects.create(user=request.user, **item)

                # PersonalInfo
                if personal_data:
                    PersonalInfo.objects.create(resume=resume, **personal_data)

                # Education
                if education_data:
                    Education.objects.bulk_create([
                        Education(resume=resume, **edu) for edu in education_data
                    ])

                # Experience
                if experience_data:
                    Experience.objects.bulk_create([
                        Experience(resume=resume, **exp) for exp in experience_data
                    ])

                # Skills
                if skills_data:
                    Skill.objects.bulk_create([
                        Skill(resume=resume, **skill) for skill in skills_data
                    ])

                # Serialize for response
                serializer = self.get_serializer(resume)
                created_items.append(serializer.data)

            return Response(created_items, status=status.HTTP_201_CREATED)

        # Single create
        personal_data = data.pop('personal', None)
        education_data = data.pop('education', [])
        experience_data = data.pop('experience', [])
        skills_data = data.pop('skills', [])

        resume = Resume.objects.create(user=request.user, **data)

        if personal_data:
            PersonalInfo.objects.create(resume=resume, **personal_data)

        for edu in education_data:  # edu is a dict
            Education.objects.create(resume=resume, **edu)

        if experience_data:
            Experience.objects.bulk_create([
                Experience(resume=resume, **exp) for exp in experience_data
            ])

        if skills_data:
            Skill.objects.bulk_create([
                Skill(resume=resume, **skill) for skill in skills_data
            ])

        serializer = self.get_serializer(resume)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    # UPDATE (PUT/PATCH)
    def update(self, request, *args, **kwargs):
        resume = self.get_object()
        data = request.data

        personal_data = data.pop('personal', None)
        education_data = data.pop('education', None)
        experience_data = data.pop('experience', None)
        skills_data = data.pop('skills', None)

        # update resume fields
        for attr, value in data.items():
            setattr(resume, attr, value)
        resume.save()

        # update personal info
        if personal_data:
            PersonalInfo.objects.update_or_create(
                resume=resume,
                defaults=personal_data
            )

        # replace education
        if education_data is not None:
            resume.education.all().delete()

            Education.objects.bulk_create([
                Education(resume=resume, **edu)
                for edu in education_data
            ])

        # replace experience
        if experience_data is not None:
            resume.experience.all().delete()

            Experience.objects.bulk_create([
                Experience(resume=resume, **exp)
                for exp in experience_data
            ])

        # replace skills
        if skills_data is not None:
            resume.skills.all().delete()

            Skill.objects.bulk_create([
                Skill(resume=resume, **skill)
                for skill in skills_data
            ])

        serializer = self.get_serializer(resume)
        return Response(serializer.data)

    # DELETE
    def destroy(self, request, *args, **kwargs):
        resume = self.get_object()

        resume.delete()

        return Response(
            {"message": "Resume deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )
    
class ResumeHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        
        user = self.request.user
        
        return Resume.objects.filter(user=user).order_by('-updated_at')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        data = [
            {
                'id': resume.id,
                'title': resume.title,
                'created_at': resume.created_at,
                'updated_at': resume.updated_at
            }
            for resume in queryset
        ]
        return Response(data)
    

class PersonalInfoViewSet(viewsets.ModelViewSet):
    queryset = PersonalInfo.objects.all()
    serializer_class = PersonalInfoSerializer
    permission_classes = [IsAuthenticated]
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    
    filterset_fields = ['resume', 'phone', 'linkedin', 'github']
    search_fields = ['phone', 'address', 'linkedin', 'github', 'summary', 'resume__title']
    ordering_fields = ['phone', 'address', 'linkedin', 'github']
    ordering = ['phone'] # default ordering
    
    
    def get_queryset(self):
        
        user = self.request.user
        
        return PersonalInfo.objects.filter(resume__user=user)

        
    def create(self, request, *args, **kwargs):
        data = request.data

        # Bulk create
        if isinstance(data, list):
            created_items = []
            for item in data:
                resume_id = item.pop('resume_id', None)
                if not resume_id:
                    return Response({'error': 'resume_id is required for each personal info'},
                                    status=status.HTTP_400_BAD_REQUEST)
                try:
                    resume = Resume.objects.get(id=resume_id, user=request.user)
                except Resume.DoesNotExist:
                    return Response({'error': f'Invalid resume_id {resume_id}'},
                                    status=status.HTTP_400_BAD_REQUEST)

                serializer = self.get_serializer(data=item)
                serializer.is_valid(raise_exception=True)
                serializer.save(resume=resume)
                created_items.append(serializer.data)

            return Response(created_items, status=status.HTTP_201_CREATED)

        # Single create
        resume_id = data.pop('resume_id', None)
        if not resume_id:
            return Response({'error': 'resume_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            resume = Resume.objects.get(id=resume_id, user=request.user)
        except Resume.DoesNotExist:
            return Response({'error': 'Invalid resume_id'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(resume=resume)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    # UPDATE
    def update(self, request, *args, **kwargs):
        personal = self.get_object()

        serializer = self.get_serializer(
            personal,
            data=request.data,
            partial=True   # allows PATCH
        )

        serializer.is_valid(raise_exception=True)

        serializer.save()

        return Response(serializer.data)

    # DELETE
    def destroy(self, request, *args, **kwargs):
        personal = self.get_object()

        personal.delete()

        return Response(
            {"message": "Personal info deleted"},
            status=status.HTTP_204_NO_CONTENT
        )
    
class EducationViewSet(viewsets.ModelViewSet):
    queryset = Education.objects.all()
    serializer_class = EducationSerializer
    permission_classes = [IsAuthenticated]
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['resume', 'institute', 'degree', 'start_year', 'end_year']
    search_fields = ['institute', 'degree', 'resume__title']
    ordering_fields = ['start_year', 'end_year', 'institute', 'degree']
    ordering = ['-start_year']
    
    def get_queryset(self):
        
        user = self.request.user
        
        return Education.objects.filter(resume__user=user)
    
    
    def create(self, request, *args, **kwargs):
        data = request.data

        # Bulk create
        if isinstance(data, list):
            created_items = []
            for item in data:
                resume_id = item.pop('resume_id', None)
                if not resume_id:
                    return Response({'error': 'resume_id is required for each education record'},
                                    status=status.HTTP_400_BAD_REQUEST)
                try:
                    resume = Resume.objects.get(id=resume_id, user=request.user)
                except Resume.DoesNotExist:
                    return Response({'error': f'Invalid resume_id {resume_id}'},
                                    status=status.HTTP_400_BAD_REQUEST)

                serializer = self.get_serializer(data=item)
                serializer.is_valid(raise_exception=True)
                serializer.save(resume=resume)  # <-- assign resume
                created_items.append(serializer.data)

            return Response(created_items, status=status.HTTP_201_CREATED)

        # Single create
        resume_id = data.pop('resume_id', None)
        if not resume_id:
            return Response({'error': 'resume_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            resume = Resume.objects.get(id=resume_id, user=request.user)
        except Resume.DoesNotExist:
            return Response({'error': 'Invalid resume_id'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(resume=resume)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):

        education = self.get_object()

        serializer = self.get_serializer(
            education,
            data=request.data,
            partial=True   # PATCH support
        )

        serializer.is_valid(raise_exception=True)

        serializer.save()

        return Response(serializer.data)



    def destroy(self, request, *args, **kwargs):
 
        education = self.get_object()

        education.delete()

        return Response(
            {"message": "Education deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )
    
class ExperienceViewSet(viewsets.ModelViewSet):
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    
    filterset_fields = ['resume', 'company', 'role', 'start_date', 'end_date']
    search_fields = ['company', 'role', 'description', 'resume__title']
    ordering_fields = ['start_date', 'end_date', 'company', 'role']
    ordering = ['-start_date']
    
    def get_queryset(self):
        
        user = self.request.user
        
        return Experience.objects.filter(resume__user=user)
    
    
    def create(self, request, *args, **kwargs):
        data = request.data

        # Bulk create
        if isinstance(data, list):
            created_items = []
            for item in data:
                resume_id = item.pop('resume_id', None)
                if not resume_id:
                    return Response({'error': 'resume_id is required for each experience record'},
                                    status=status.HTTP_400_BAD_REQUEST)
                try:
                    resume = Resume.objects.get(id=resume_id, user=request.user)
                except Resume.DoesNotExist:
                    return Response({'error': f'Invalid resume_id {resume_id}'},
                                    status=status.HTTP_400_BAD_REQUEST)

                serializer = self.get_serializer(data=item)
                serializer.is_valid(raise_exception=True)
                serializer.save(resume=resume)  # <-- link to resume
                created_items.append(serializer.data)

            return Response(created_items, status=status.HTTP_201_CREATED)

        # Single create
        resume_id = data.pop('resume_id', None)
        if not resume_id:
            return Response({'error': 'resume_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            resume = Resume.objects.get(id=resume_id, user=request.user)
        except Resume.DoesNotExist:
            return Response({'error': 'Invalid resume_id'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(resume=resume)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    # UPDATE (PUT / PATCH)
    def update(self, request, *args, **kwargs):

        experience = self.get_object()

        serializer = self.get_serializer(
            experience,
            data=request.data,
            partial=True
        )

        serializer.is_valid(raise_exception=True)

        serializer.save()

        return Response(serializer.data)


    # DELETE
    def destroy(self, request, *args, **kwargs):

        experience = self.get_object()

        experience.delete()

        return Response(
            {"message": "Experience deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )
    
class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    
    filterset_fields = ['resume', 'name']
    search_fields = ['name', 'resume__title']
    ordering_fields = ['name']
    ordering = ['name']
    
    def get_queryset(self):
        
        user = self.request.user
        
        return Skill.objects.filter(resume__user=user)
    
    
    def create(self, request, *args, **kwargs):
        data = request.data

    # Bulk create
        if isinstance(data, list):
            created_items = []
            for item in data:

                if isinstance(item, str):
                    item = {"name": item}

                resume_id = item.pop('resume_id', None)
                if not resume_id:
                    return Response(
                        {'error': 'resume_id is required'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                try:
                    resume = Resume.objects.get(id=resume_id, user=request.user)
                except Resume.DoesNotExist:
                    return Response(
                        {'error': f'Invalid resume_id {resume_id}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                serializer = self.get_serializer(data=item)
                serializer.is_valid(raise_exception=True)
                serializer.save(resume=resume)

                created_items.append(serializer.data)

            return Response(created_items, status=status.HTTP_201_CREATED)

    # Single create
        if isinstance(data, str):
            data = {"name": data}

        resume_id = data.pop('resume_id', None)
        if not resume_id:
            return Response({'error': 'resume_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        resume = Resume.objects.get(id=resume_id, user=request.user)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(resume=resume)

        return Response(serializer.data, status=status.HTTP_201_CREATED)
    # UPDATE
    def update(self, request, *args, **kwargs):

        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=True
        )

        serializer.is_valid(raise_exception=True)

        serializer.save()

        return Response(serializer.data)


    # DELETE
    def destroy(self, request, *args, **kwargs):

        instance = self.get_object()

        instance.delete()

        return Response(
            {"message": "deleted"},
            status=204
        )
        
class ResumePDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, format=None):
        try:
            resume = Resume.objects.get(id=pk, user=request.user)
        except Resume.DoesNotExist:
            return HttpResponse("Resume not found", status=404)

        # Render HTML using Django template
        html_string = render_to_string('resume_pdf_template.html', {'resume': resume})

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{resume.title}.pdf"'

        # Create PDF
        pisa_status = pisa.CreatePDF(html_string, dest=response)
        if pisa_status.err:
            return HttpResponse("Error generating PDF", status=500)

        return response