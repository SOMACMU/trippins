from django import forms
from models import *

class LoginForm(forms.Form):
    username = forms.CharField(max_length = 20,
                               widget = forms.TextInput(attrs={'placeholder': 'User Name', 'class': 'login-input form-control'}))
    password = forms.CharField(max_length = 20,
                               widget = forms.PasswordInput(attrs = {'placeholder': 'Password', 'class': 'login-input form-control'}))
    
    def clean_username(self):
        if not User.objects.filter(username=self.cleaned_data['username']):
            print 'user validate fail'
            raise forms.ValidationError("User Does Not Exist.")

        print 'valid user'
        return self.cleaned_data['username']

class RegistrationForm(forms.Form):
    username = forms.CharField(max_length = 20,
                                widget = forms.TextInput(attrs={'placeholder': 'User Name', 'class': 'login-input form-control'}))
    email = forms.EmailField(widget = forms.EmailInput(attrs={'placeholder': 'Email', 'class': 'login-input form-control'}))
    first_name = forms.CharField(max_length = 20,
                                 widget = forms.TextInput(attrs={'placeholder': 'First Name', 'class': 'login-input form-control'}))
    last_name = forms.CharField(max_length = 20,
                                widget = forms.TextInput(attrs={'placeholder': 'Last Name', 'class': 'login-input form-control'}))
    password1 = forms.CharField(max_length = 200,
                                label='Password',
                                widget = forms.PasswordInput(attrs = {'placeholder': 'Password', 'class': 'login-input form-control'}))
    password2 = forms.CharField(max_length = 200,
                                label='Confirm Password',
                                widget = forms.PasswordInput(attrs = {'placeholder': 'Confirm Password', 'class': 'login-input form-control'}))
    #invite_code = forms.CharField(max_length = 20,
    #                            label='Invite Code',
    #                            widget = forms.TextInput(attrs={'placeholder':'Invite Code', 'class': 'login-input form-control'}))

    def clean(self):
        cleaned_data = super(RegistrationForm, self).clean()
        pwd1 = cleaned_data.get('password1')
        pwd2 = cleaned_data.get('password2')
        #invite_code = cleaned_data.get('invite_code')

        if pwd1 and pwd2 and pwd1 != pwd2:
            print 'Passwords Did Not Match'
            raise forms.ValidationError("Your passwords do not match each other, please try again")
            print forms.error

        #if len(InviteCode.objects.filter(code=invite_code))==0:
        #    raise forms.ValidationError("Invalid invite code")
        #code = InviteCode.objects.get(code=invite_code)
        #code.delete()

        return cleaned_data

    # make sure distinct username
    def clean_username(self):
        username = self.cleaned_data.get('username')

        if User.objects.filter(username__exact=username):
            raise forms.ValidationError("Your username has already been taken, please try another one")
            print forms.error

        return username

    def clean_password1(self):
        pwd = self.cleaned_data.get('password1')
        
        # if len(pwd)<3:
        #     raise forms.ValidationError("pwd too short")
        #     print forms.error

        return pwd


class ProfileSettingForm(forms.Form):
    avatar = forms.ImageField(label="Avatar",
                                widget = forms.FileInput(attrs={'id': 'avatar'}))
    email = forms.EmailField(label="Email",
                                widget = forms.EmailInput(attrs={'id': 'email'}))
    first_name = forms.CharField(max_length = 20,
                                 label = "First Name",
                                 widget = forms.TextInput(attrs={'id': 'first_name'}))
    last_name = forms.CharField(max_length = 20,
                                label = "Last Name",
                                widget = forms.TextInput(attrs={'id': 'last_name'}))
    bio = forms.CharField(max_length = 420,
                            label="Bio",
                            widget = forms.TextInput(attrs={'id': 'bio'}))

    def clean(self):
        cleaned_data = super(ProfileSettingForm, self).clean()
        return cleaned_data

class PasswordSettingForm(forms.Form):
    password1 = forms.CharField(max_length = 200,
                                label='Password',
                                widget = forms.PasswordInput(attrs = {'id': 'password'}))
    password2 = forms.CharField(max_length = 200,
                                label='Confirm Password',
                                widget = forms.PasswordInput(attrs = {'id': 'confirm_password'}))
    def clean(self):
        cleaned_data = super(PasswordSettingForm, self).clean()

        pwd1 = cleaned_data.get('password1')
        pwd2 = cleaned_data.get('password2')

        if pwd1 and pwd2 and pwd1 != pwd2:
            print 'Passwords Did Not Match'
            raise forms.ValidationError("Passwords Did Not Match")
            print forms.error

        return cleaned_data

    def clean_password1(self):
        pwd = self.cleaned_data.get('password1')

        if len(pwd)<3:
            raise forms.ValidationError("pwd too short")
            print forms.error

        return pwd

class PinCreateForm(forms.Form):
    description = forms.CharField(max_length = 120,
                                widget = forms.Textarea(attrs={'placeholder': 'Description', 'class': 'pin-desc'}))
    def clean(self):
        cleaned_data = super(PinCreateForm, self).clean()
        content = cleaned_data.get('description')
        if len(content) > 120 or len(content)<1:
            raise forms.ValidationError("Invalid description length")
            print forms.error

        return cleaned_data
