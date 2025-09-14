package com.assetdesk.spec;

import com.assetdesk.domain.Vendor;
import org.springframework.data.jpa.domain.Specification;
import java.util.Locale;

public class VendorSpecifications {

    public static Specification<Vendor> hasNameLike(String name) {
        return (root, query, cb) -> {
            if (name == null || name.trim().isEmpty()) return null;
            return cb.like(cb.lower(root.get("name")), "%" + name.trim().toLowerCase(Locale.ROOT) + "%");
        };
    }

    public static Specification<Vendor> hasEmailLike(String email) {
        return (root, query, cb) -> {
            if (email == null || email.trim().isEmpty()) return null;
            return cb.like(cb.lower(root.get("email")), "%" + email.trim().toLowerCase(Locale.ROOT) + "%");
        };
    }

    public static Specification<Vendor> hasPhoneLike(String phone) {
        return (root, query, cb) -> {
            if (phone == null || phone.trim().isEmpty()) return null;
            return cb.like(cb.lower(root.get("phoneNumber")), "%" + phone.trim().toLowerCase(Locale.ROOT) + "%");
        };
    }

    public static Specification<Vendor> hasContactPersonLike(String contactPerson) {
        return (root, query, cb) -> {
            if (contactPerson == null || contactPerson.trim().isEmpty()) return null;
            return cb.like(cb.lower(root.get("contactPerson")), "%" + contactPerson.trim().toLowerCase(Locale.ROOT) + "%");
        };
    }

    public static Specification<Vendor> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.trim().isEmpty()) return null;
            try {
                Vendor.Status s = Vendor.Status.valueOf(status.trim().toUpperCase(Locale.ROOT));
                return cb.equal(root.get("status"), s);
            } catch (IllegalArgumentException ex) {
                return cb.disjunction();
            }
        };
    }

    public static Specification<Vendor> hasGlobalSearch(String searchTerm) {
        return (root, query, cb) -> {
            if (searchTerm == null || searchTerm.trim().isEmpty()) return null;
            String term = "%" + searchTerm.trim().toLowerCase(Locale.ROOT) + "%";
            return cb.or(
                cb.like(cb.lower(root.get("name")), term),
                cb.like(cb.lower(root.get("email")), term),
                cb.like(cb.lower(root.get("phoneNumber")), term),
                cb.like(cb.lower(root.get("contactPerson")), term)
            );
        };
    }
}