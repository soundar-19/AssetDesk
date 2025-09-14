package com.assetdesk.spec;

import com.assetdesk.domain.Asset;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.JoinType;
import java.util.Locale;

public class AssetSpecifications {

    public static Specification<Asset> hasNameLike(String name) {
        return (root, query, cb) -> {
            if (name == null || name.trim().isEmpty()) return null;
            return cb.like(cb.lower(root.get("name")), "%" + name.trim().toLowerCase(Locale.ROOT) + "%");
        };
    }

    public static Specification<Asset> hasCategory(String category) {
        return (root, query, cb) -> {
            if (category == null || category.trim().isEmpty()) return null;
            try {
                Asset.Category cat = Asset.Category.valueOf(category.trim().toUpperCase(Locale.ROOT));
                return cb.equal(root.get("category"), cat);
            } catch (IllegalArgumentException ex) {
                return cb.disjunction();
            }
        };
    }

    public static Specification<Asset> hasType(String type) {
        return (root, query, cb) -> {
            if (type == null || type.trim().isEmpty()) return null;
            try {
                Asset.AssetType t = Asset.AssetType.valueOf(type.trim().toUpperCase(Locale.ROOT));
                return cb.equal(root.get("type"), t);
            } catch (IllegalArgumentException ex) {
                return cb.disjunction();
            }
        };
    }

    public static Specification<Asset> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.trim().isEmpty()) return null;
            try {
                Asset.Status s = Asset.Status.valueOf(status.trim().toUpperCase(Locale.ROOT));
                return cb.equal(root.get("status"), s);
            } catch (IllegalArgumentException ex) {
                return cb.disjunction();
            }
        };
    }

    public static Specification<Asset> hasAssetTagLike(String assetTag) {
        return (root, query, cb) -> {
            if (assetTag == null || assetTag.trim().isEmpty()) return null;
            return cb.like(cb.lower(root.get("assetTag")), "%" + assetTag.trim().toLowerCase(Locale.ROOT) + "%");
        };
    }

    public static Specification<Asset> hasModelLike(String model) {
        return (root, query, cb) -> {
            if (model == null || model.trim().isEmpty()) return null;
            return cb.like(cb.lower(root.get("model")), "%" + model.trim().toLowerCase(Locale.ROOT) + "%");
        };
    }

    public static Specification<Asset> hasSerialNumberLike(String serialNumber) {
        return (root, query, cb) -> {
            if (serialNumber == null || serialNumber.trim().isEmpty()) return null;
            return cb.like(cb.lower(root.get("serialNumber")), "%" + serialNumber.trim().toLowerCase(Locale.ROOT) + "%");
        };
    }

    public static Specification<Asset> hasVendorNameLike(String vendorName) {
        return (root, query, cb) -> {
            if (vendorName == null || vendorName.trim().isEmpty()) return null;
            var vendorJoin = root.join("vendor", JoinType.LEFT);
            return cb.like(cb.lower(vendorJoin.get("name")), "%" + vendorName.trim().toLowerCase(Locale.ROOT) + "%");
        };
    }

    public static Specification<Asset> hasGlobalSearch(String searchTerm) {
        return (root, query, cb) -> {
            if (searchTerm == null || searchTerm.trim().isEmpty()) return null;
            String term = "%" + searchTerm.trim().toLowerCase(Locale.ROOT) + "%";
            var vendorJoin = root.join("vendor", JoinType.LEFT);
            return cb.or(
                cb.like(cb.lower(root.get("name")), term),
                cb.like(cb.lower(root.get("assetTag")), term),
                cb.like(cb.lower(root.get("model")), term),
                cb.like(cb.lower(root.get("serialNumber")), term),
                cb.like(cb.lower(vendorJoin.get("name")), term)
            );
        };
    }
}


