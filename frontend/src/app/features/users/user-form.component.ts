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
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
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