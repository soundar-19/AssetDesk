package com.assetdesk.spec;

import com.assetdesk.domain.Issue;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.JoinType;
import java.util.Locale;

public class IssueSpecifications {

    public static Specification<Issue> hasTitleLike(String title) {
        return (root, query, cb) -> {
            if (title == null || title.trim().isEmpty()) return null;
            return cb.like(cb.lower(root.get("title")), "%" + title.trim().toLowerCase(Locale.ROOT) + "%");
        };
    }

    public static Specification<Issue> hasDescriptionLike(String description) {
        return (root, query, cb) -> {
            if (description == null || description.trim().isEmpty()) return null;
            return cb.like(cb.lower(root.get("description")), "%" + description.trim().toLowerCase(Locale.ROOT) + "%");
        };
    }

    public static Specification<Issue> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.trim().isEmpty()) return null;
            try {
                Issue.Status s = Issue.Status.valueOf(status.trim().toUpperCase(Locale.ROOT));
                return cb.equal(root.get("status"), s);
            } catch (IllegalArgumentException ex) {
                return cb.disjunction();
            }
        };
    }

    public static Specification<Issue> hasPriority(String priority) {
        return (root, query, cb) -> {
            if (priority == null || priority.trim().isEmpty()) return null;
            try {
                Issue.Priority p = Issue.Priority.valueOf(priority.trim().toUpperCase(Locale.ROOT));
                return cb.equal(root.get("priority"), p);
            } catch (IllegalArgumentException ex) {
                return cb.disjunction();
            }
        };
    }

    public static Specification<Issue> hasType(String type) {
        return (root, query, cb) -> {
            if (type == null || type.trim().isEmpty()) return null;
            try {
                Issue.IssueType t = Issue.IssueType.valueOf(type.trim().toUpperCase(Locale.ROOT));
                return cb.equal(root.get("type"), t);
            } catch (IllegalArgumentException ex) {
                return cb.disjunction();
            }
        };
    }

    public static Specification<Issue> hasReportedBy(Long reportedById) {
        return (root, query, cb) -> {
            if (reportedById == null) return null;
            var join = root.join("reportedBy", JoinType.LEFT);
            return cb.equal(join.get("id"), reportedById);
        };
    }

    public static Specification<Issue> hasAssignedTo(Long assignedToId) {
        return (root, query, cb) -> {
            if (assignedToId == null) return null;
            var join = root.join("assignedTo", JoinType.LEFT);
            return cb.equal(join.get("id"), assignedToId);
        };
    }

    public static Specification<Issue> hasAsset(Long assetId) {
        return (root, query, cb) -> {
            if (assetId == null) return null;
            var join = root.join("asset", JoinType.LEFT);
            return cb.equal(join.get("id"), assetId);
        };
    }

    public static Specification<Issue> hasGlobalSearch(String searchTerm) {
        return (root, query, cb) -> {
            if (searchTerm == null || searchTerm.trim().isEmpty()) return null;
            String term = "%" + searchTerm.trim().toLowerCase(Locale.ROOT) + "%";
            var assetJoin = root.join("asset", JoinType.LEFT);
            var reportedByJoin = root.join("reportedBy", JoinType.LEFT);
            var assignedToJoin = root.join("assignedTo", JoinType.LEFT);
            return cb.or(
                cb.like(cb.lower(root.get("title")), term),
                cb.like(cb.lower(root.get("description")), term),
                cb.like(cb.lower(assetJoin.get("name")), term),
                cb.like(cb.lower(assetJoin.get("assetTag")), term),
                cb.like(cb.lower(reportedByJoin.get("name")), term),
                cb.like(cb.lower(assignedToJoin.get("name")), term)
            );
        };
    }
}