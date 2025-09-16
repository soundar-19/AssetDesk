import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ProfessionalFormComponent, FormSectionComponent, FormFieldComponent, FormAction } from '../../shared/components/professional-form';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProfessionalFormComponent, FormSectionComponent, FormFieldComponent],
  template: `
    <app-professional-form
      [title]="isEditMode ? 'Edit User' : 'Create New User'"
      [description]="isEditMode ? 'Update user information and system permissions' : 'Add a new user to the asset management system'"
      [formGroup]="userForm"
      [actions]="formActions"
      [headerActions]="headerActions"
      (formSubmit)="onSubmit()">
      
      <app-form-section
        title="Personal Information"
        description="Basic user details and identification"
        icon="personal">
        
        <app-form-field
          label="Employee ID"
          fieldId="employeeId"
          type="text"
          [control]="employeeIdControl"
          placeholder="Enter unique employee ID"
          [required]="true"
          icon="tag">
        </app-form-field>
        
        <app-form-field
          label="Full Name"
          fieldId="name"
          type="text"
          [control]="nameControl"
          placeholder="Enter full name"
          [required]="true"
          icon="user">
        </app-form-field>
      </app-form-section>
      
      <app-form-section
        title="Contact Information"
        description="Communication details and contact preferences"
        icon="contact">
        
        <app-form-field
          label="Email Address"
          fieldId="email"
          type="email"
          [control]="emailControl"
          placeholder="Enter email address"
          [required]="true"
          icon="email">
        </app-form-field>
        
        <app-form-field
          label="Phone Number"
          fieldId="phoneNumber"
          type="tel"
          [control]="phoneNumberControl"
          placeholder="Enter phone number"
          [required]="false"
          icon="phone">
        </app-form-field>
      </app-form-section>
      
      <app-form-section
        title="Role & Department"
        description="System permissions and organizational details"
        icon="role">
        
        <app-form-field
          label="System Role"
          fieldId="role"
          type="select"
          [control]="roleControl"
          [required]="true"
          icon="shield"
          [options]="roleOptions">
        </app-form-field>
        
        <app-form-field
          label="Account Status"
          fieldId="status"
          type="select"
          [control]="statusControl"
          [required]="true"
          icon="check"
          [options]="statusOptions">
        </app-form-field>
        
        <app-form-field
          label="Department"
          fieldId="department"
          type="text"
          [control]="departmentControl"
          placeholder="Enter department name"
          [required]="false"
          icon="building">
        </app-form-field>
        
        <app-form-field
          label="Job Title"
          fieldId="designation"
          type="text"
          [control]="designationControl"
          placeholder="Enter job title or designation"
          [required]="false"
          icon="tag">
        </app-form-field>
      </app-form-section>
      
      <app-form-section
        *ngIf="!isEditMode"
        title="Security Settings"
        description="Initial password and security configuration"
        icon="security">
        
        <app-form-field
          label="Initial Password"
          fieldId="password"
          type="password"
          [control]="passwordControl"
          placeholder="Enter initial password"
          [required]="true"
          icon="lock"
          helpText="Password must be at least 6 characters long. User can change it after first login."
          [fullWidth]="true">
        </app-form-field>
      </app-form-section>
    </app-professional-form>
  `,
  styles: []
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  userId: number | null = null;
  loading = false;
  
  formActions: FormAction[] = [];
  headerActions: FormAction[] = [];
  
  roleOptions = [
    { value: 'EMPLOYEE', label: 'Employee' },
    { value: 'ADMIN', label: 'Administrator' },
    { value: 'IT_SUPPORT', label: 'IT Support' }
  ];
  
  statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    this.userForm = this.fb.group({
      employeeId: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      role: ['EMPLOYEE', Validators.required],
      department: [''],
      designation: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      status: ['ACTIVE', Validators.required]
    });
  }

  get employeeIdControl() { return this.userForm.get('employeeId') as any; }
  get nameControl() { return this.userForm.get('name') as any; }
  get emailControl() { return this.userForm.get('email') as any; }
  get phoneNumberControl() { return this.userForm.get('phoneNumber') as any; }
  get roleControl() { return this.userForm.get('role') as any; }
  get statusControl() { return this.userForm.get('status') as any; }
  get departmentControl() { return this.userForm.get('department') as any; }
  get designationControl() { return this.userForm.get('designation') as any; }
  get passwordControl() { return this.userForm.get('password') as any; }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.userId = +id;
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
      this.loadUser(this.userId);
    }
    this.setupFormActions();
  }
  
  setupFormActions() {
    this.headerActions = [
      {
        label: 'Back to Users',
        type: 'button',
        variant: 'outline',
        icon: 'back',
        action: () => this.goBack()
      }
    ];
    
    this.formActions = [
      {
        label: 'Cancel',
        type: 'button',
        variant: 'secondary',
        icon: 'cancel',
        action: () => this.goBack()
      },
      {
        label: this.isEditMode ? 'Update User' : 'Create User',
        type: 'submit',
        variant: 'primary',
        size: 'lg',
        icon: this.isEditMode ? 'save' : 'add',
        loading: this.loading,
        disabled: this.loading
      }
    ];
  }

  loadUser(id: number) {
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.userForm.patchValue(user);
      },
      error: () => {
        this.toastService.error('Failed to load user');
        this.goBack();
      }
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.loading = true;
      const userData = this.userForm.value;
      
      const request = this.isEditMode 
        ? this.userService.updateUser(this.userId!, userData)
        : this.userService.createUser(userData);

      request.subscribe({
        next: () => {
          this.toastService.success(`User ${this.isEditMode ? 'updated' : 'created'} successfully`);
          this.loading = false;
          this.goBack();
        },
        error: () => {
          this.toastService.error(`Failed to ${this.isEditMode ? 'update' : 'create'} user`);
          this.loading = false;
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/users']);
  }
}