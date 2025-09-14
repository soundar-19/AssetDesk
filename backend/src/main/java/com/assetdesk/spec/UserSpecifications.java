package com.assetdesk.spec;

import com.assetdesk.domain.User;
import org.springframework.data.jpa.domain.Specification;
import java.util.Locale;

public class UserSpecifications {

    public static Specification<User> hasNameLike(String name) {
        return (root, query, cb) -> {
            if (name == null || name.trim().isEmpty()) return null;
            return cb.like(cb.lower(root.get("name")), "%" + name.trim().toLowerCase(Locale.ROOT) + "%");
        };
    }

    public static Specification<User> hasEmailLike(String email) {
        return (root, query, cb) -> {
            if (email == null || email.trim().isEmpty()) return null;
            return cb.like(cb.lower(root.get("email")), "%" + email.trim().toLowerCase(Locale.ROOT) + "%");
        };
    }

    public static Specification<User> hasEmployeeIdLike(String employeeId) {
        return (root, query, cb) -> {
            if (employeeId == null || employeeId.trim().isEmpty()) return null;
            return cb.like(cb.lower(root.get("employeeId")), "%" + employeeId.trim().toLowerCase(Locale.ROOT) + "%");
        };
    }

    public static Specification<User> hasDepartmentLike(String department) {
        return (root, query, cb) -> {
            if (department == null || department.trim().isEmpty()) return null;
            return cb.like(cb.lower(root.get("department")), "%" + department.trim().toLowerCase(Locale.ROOT) + "%");
        };
    }

    public static Specification<User> hasRole(String role) {
        return (root, query, cb) -> {
            if (role == null || role.trim().isEmpty()) return null;
            try {
                User.Role r = User.Role.valueOf(role.trim().toUpperCase(Locale.ROOT));
                return cb.equal(root.get("role"), r);
            } catch (IllegalArgumentException ex) {
                return cb.disjunction();
            }
        };
    }

    public static Specification<User> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.trim().isEmpty()) return null;
            try {
                User.Status s = User.Status.valueOf(status.trim().toUpperCase(Locale.ROOT));
                return cb.equal(root.get("status"), s);
            } catch (IllegalArgumentException ex) {
                return cb.disjunction();
            }
        };
    }

    public static Specification<User> hasGlobalSearch(String searchTerm) {
        return (root, query, cb) -> {
            if (searchTerm == null || searchTerm.trim().isEmpty()) return null;
            String term = "%" + searchTerm.trim().toLowerCase(Locale.ROOT) + "%";
            return cb.or(
                cb.like(cb.lower(root.get("name")), term),
                cb.like(cb.lower(root.get("email")), term),
                cb.like(cb.lower(root.get("employeeId")), term),
                cb.like(cb.lower(root.get("department")), term)
            );
        };
    }
}