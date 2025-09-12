package com.assetdesk.spec;

import com.assetdesk.domain.User;
import org.springframework.data.jpa.domain.Specification;
import java.util.Locale;

public class UserSpecifications {

    public static Specification<User> hasNameLike(String name) {
        return (root, query, cb) -> name == null || name.isBlank() ? null : 
            cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase(Locale.ROOT) + "%");
    }

    public static Specification<User> hasEmailLike(String email) {
        return (root, query, cb) -> email == null || email.isBlank() ? null : 
            cb.like(cb.lower(root.get("email")), "%" + email.toLowerCase(Locale.ROOT) + "%");
    }

    public static Specification<User> hasEmployeeIdLike(String employeeId) {
        return (root, query, cb) -> employeeId == null || employeeId.isBlank() ? null : 
            cb.like(cb.lower(root.get("employeeId")), "%" + employeeId.toLowerCase(Locale.ROOT) + "%");
    }

    public static Specification<User> hasDepartmentLike(String department) {
        return (root, query, cb) -> department == null || department.isBlank() ? null : 
            cb.like(cb.lower(root.get("department")), "%" + department.toLowerCase(Locale.ROOT) + "%");
    }

    public static Specification<User> hasRole(String role) {
        return (root, query, cb) -> {
            if (role == null || role.isBlank()) return null;
            try {
                User.Role r = User.Role.valueOf(role.toUpperCase(Locale.ROOT));
                return cb.equal(root.get("role"), r);
            } catch (IllegalArgumentException ex) {
                return cb.disjunction();
            }
        };
    }

    public static Specification<User> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank()) return null;
            try {
                User.Status s = User.Status.valueOf(status.toUpperCase(Locale.ROOT));
                return cb.equal(root.get("status"), s);
            } catch (IllegalArgumentException ex) {
                return cb.disjunction();
            }
        };
    }
}