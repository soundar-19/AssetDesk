package com.assetdesk.spec;

import com.assetdesk.domain.Asset;
import org.springframework.data.jpa.domain.Specification;
import java.util.Locale;

public class AssetSpecifications {

    public static Specification<Asset> hasNameLike(String name) {
        return (root, query, cb) -> name == null || name.isBlank() ? null : cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase(Locale.ROOT) + "%");
    }

    public static Specification<Asset> hasCategory(String category) {
        return (root, query, cb) -> {
            if (category == null || category.isBlank()) return null;
            try {
                Asset.Category cat = Asset.Category.valueOf(category.toUpperCase(Locale.ROOT));
                return cb.equal(root.get("category"), cat);
            } catch (IllegalArgumentException ex) {
                return cb.disjunction();
            }
        };
    }

    public static Specification<Asset> hasType(String type) {
        return (root, query, cb) -> {
            if (type == null || type.isBlank()) return null;
            try {
                Asset.AssetType t = Asset.AssetType.valueOf(type.toUpperCase(Locale.ROOT));
                return cb.equal(root.get("type"), t);
            } catch (IllegalArgumentException ex) {
                return cb.disjunction();
            }
        };
    }

    public static Specification<Asset> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank()) return null;
            try {
                Asset.Status s = Asset.Status.valueOf(status.toUpperCase(Locale.ROOT));
                return cb.equal(root.get("status"), s);
            } catch (IllegalArgumentException ex) {
                return cb.disjunction();
            }
        };
    }

    public static Specification<Asset> hasAssetTagLike(String assetTag) {
        return (root, query, cb) -> assetTag == null || assetTag.isBlank() ? null : 
            cb.like(cb.lower(root.get("assetTag")), "%" + assetTag.toLowerCase(Locale.ROOT) + "%");
    }

    public static Specification<Asset> hasModelLike(String model) {
        return (root, query, cb) -> model == null || model.isBlank() ? null : 
            cb.like(cb.lower(root.get("model")), "%" + model.toLowerCase(Locale.ROOT) + "%");
    }

    public static Specification<Asset> hasSerialNumberLike(String serialNumber) {
        return (root, query, cb) -> serialNumber == null || serialNumber.isBlank() ? null : 
            cb.like(cb.lower(root.get("serialNumber")), "%" + serialNumber.toLowerCase(Locale.ROOT) + "%");
    }

    public static Specification<Asset> hasVendorNameLike(String vendorName) {
        return (root, query, cb) -> {
            if (vendorName == null || vendorName.isBlank()) return null;
            return cb.like(cb.lower(root.get("vendor").get("name")), "%" + vendorName.toLowerCase(Locale.ROOT) + "%");
        };
    }
}


