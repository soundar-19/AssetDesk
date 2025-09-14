package com.assetdesk.spec;

import com.assetdesk.domain.ServiceRecord;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.JoinType;
import java.time.LocalDate;
import java.util.Locale;

public class ServiceRecordSpecifications {

    public static Specification<ServiceRecord> hasServiceType(String serviceType) {
        return (root, query, cb) -> {
            if (serviceType == null || serviceType.trim().isEmpty()) return null;
            return cb.equal(root.get("serviceType"), serviceType.trim());
        };
    }

    public static Specification<ServiceRecord> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.trim().isEmpty()) return null;
            return cb.equal(root.get("status"), status.trim());
        };
    }

    public static Specification<ServiceRecord> hasVendorName(String vendorName) {
        return (root, query, cb) -> {
            if (vendorName == null || vendorName.trim().isEmpty()) return null;
            var vendorJoin = root.join("vendor", JoinType.LEFT);
            return cb.like(cb.lower(vendorJoin.get("name")), "%" + vendorName.trim().toLowerCase(Locale.ROOT) + "%");
        };
    }

    public static Specification<ServiceRecord> hasAssetTag(String assetTag) {
        return (root, query, cb) -> {
            if (assetTag == null || assetTag.trim().isEmpty()) return null;
            var assetJoin = root.join("asset", JoinType.LEFT);
            return cb.like(cb.lower(assetJoin.get("assetTag")), "%" + assetTag.trim().toLowerCase(Locale.ROOT) + "%");
        };
    }

    public static Specification<ServiceRecord> hasAssetName(String assetName) {
        return (root, query, cb) -> {
            if (assetName == null || assetName.trim().isEmpty()) return null;
            var assetJoin = root.join("asset", JoinType.LEFT);
            return cb.like(cb.lower(assetJoin.get("name")), "%" + assetName.trim().toLowerCase(Locale.ROOT) + "%");
        };
    }

    public static Specification<ServiceRecord> hasDescriptionLike(String description) {
        return (root, query, cb) -> {
            if (description == null || description.trim().isEmpty()) return null;
            return cb.like(cb.lower(root.get("serviceDescription")), "%" + description.trim().toLowerCase(Locale.ROOT) + "%");
        };
    }

    public static Specification<ServiceRecord> hasPerformedBy(String performedBy) {
        return (root, query, cb) -> {
            if (performedBy == null || performedBy.trim().isEmpty()) return null;
            return cb.like(cb.lower(root.get("performedBy")), "%" + performedBy.trim().toLowerCase(Locale.ROOT) + "%");
        };
    }

    public static Specification<ServiceRecord> hasServiceDateBetween(LocalDate startDate, LocalDate endDate) {
        return (root, query, cb) -> {
            if (startDate == null && endDate == null) return null;
            if (startDate != null && endDate != null) {
                return cb.between(root.get("serviceDate"), startDate, endDate);
            } else if (startDate != null) {
                return cb.greaterThanOrEqualTo(root.get("serviceDate"), startDate);
            } else {
                return cb.lessThanOrEqualTo(root.get("serviceDate"), endDate);
            }
        };
    }

    public static Specification<ServiceRecord> hasCostBetween(Double minCost, Double maxCost) {
        return (root, query, cb) -> {
            if (minCost == null && maxCost == null) return null;
            if (minCost != null && maxCost != null) {
                return cb.between(root.get("cost"), minCost, maxCost);
            } else if (minCost != null) {
                return cb.greaterThanOrEqualTo(root.get("cost"), minCost);
            } else {
                return cb.lessThanOrEqualTo(root.get("cost"), maxCost);
            }
        };
    }

    public static Specification<ServiceRecord> hasGlobalSearch(String searchTerm) {
        return (root, query, cb) -> {
            if (searchTerm == null || searchTerm.trim().isEmpty()) return null;
            String term = "%" + searchTerm.trim().toLowerCase(Locale.ROOT) + "%";
            var assetJoin = root.join("asset", JoinType.LEFT);
            var vendorJoin = root.join("vendor", JoinType.LEFT);
            return cb.or(
                cb.like(cb.lower(root.get("serviceDescription")), term),
                cb.like(cb.lower(root.get("performedBy")), term),
                cb.like(cb.lower(assetJoin.get("name")), term),
                cb.like(cb.lower(assetJoin.get("assetTag")), term),
                cb.like(cb.lower(vendorJoin.get("name")), term)
            );
        };
    }
}