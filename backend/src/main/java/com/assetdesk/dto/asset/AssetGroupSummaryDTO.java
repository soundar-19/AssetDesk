package com.assetdesk.dto.asset;

import lombok.Data;
import java.util.List;

@Data
public class AssetGroupSummaryDTO {
    private String name;
    private long total;
    private long available;
    private long allocated;
    private long maintenance;
    private long retired;
    private long lost;
    private List<UserBrief> allocatedUsers;

    @Data
    public static class UserBrief {
        private Long id;
        private String name;
        private String department;
        private String email;
    }
}


