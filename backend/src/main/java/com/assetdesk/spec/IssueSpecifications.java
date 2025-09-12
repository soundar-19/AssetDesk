package com.assetdesk.spec;

import com.assetdesk.domain.Issue;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.JoinType;
import java.util.Locale;

public class IssueSpecifications {

    public static Specification<Issue> hasTitleLike(String title) {
        return (root, query, cb) -> title == null || title.isBlank() ? null : 
            cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase(Locale.ROOT) + "%");
    }

    public static Specification<Issue> hasDescriptionLike(String description) {
        return (root, query, cb) -> description == null || description.isBlank() ? null : 
            cb.like(cb.lower(root.get("description")), "%" + description.toLowerCase(Locale.ROOT) + "%");
    }

    public static Specification<Issue> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank()) return null;
            try {
                Issue.Status s = Issue.Status.valueOf(status.toUpperCase(Locale.ROOT));
                return cb.equal(root.get("status"), s);
            } catch (IllegalArgumentException ex) {
                return cb.disjunction();
            }
        };
    }

    public static Specification<Issue> hasPriority(String priority) {
        return (root, query, cb) -> {
            if (priority == null || priority.isBlank()) return null;
            try {
                Issue.Priority p = Issue.Priority.valueOf(priority.toUpperCase(Locale.ROOT));
                return cb.equal(root.get("priority"), p);
            } catch (IllegalArgumentException ex) {
                return cb.disjunction();
            }
        };
    }

    public static Specification<Issue> hasType(String type) {
        return (root, query, cb) -> {
            if (type == null || type.isBlank()) return null;
            try {
                Issue.IssueType t = Issue.IssueType.valueOf(type.toUpperCase(Locale.ROOT));
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
}