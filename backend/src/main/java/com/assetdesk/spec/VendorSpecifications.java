package com.assetdesk.spec;

import com.assetdesk.domain.Vendor;
import org.springframework.data.jpa.domain.Specification;
import java.util.Locale;

public class VendorSpecifications {

    public static Specification<Vendor> hasNameLike(String name) {
        return (root, query, cb) -> name == null || name.isBlank() ? null : 
            cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase(Locale.ROOT) + "%");
    }

    public static Specification<Vendor> hasEmailLike(String email) {
        return (root, query, cb) -> email == null || email.isBlank() ? null : 
            cb.like(cb.lower(root.get("email")), "%" + email.toLowerCase(Locale.ROOT) + "%");
    }

    public static Specification<Vendor> hasPhoneLike(String phone) {
        return (root, query, cb) -> phone == null || phone.isBlank() ? null : 
            cb.like(cb.lower(root.get("phone")), "%" + phone.toLowerCase(Locale.ROOT) + "%");
    }

    public static Specification<Vendor> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank()) return null;
            try {
                Vendor.Status s = Vendor.Status.valueOf(status.toUpperCase(Locale.ROOT));
                return cb.equal(root.get("status"), s);
            } catch (IllegalArgumentException ex) {
                return cb.disjunction();
            }
        };
    }
}