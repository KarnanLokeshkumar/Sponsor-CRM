package com.sponsorcrm.controller;

public record RecordSearchResult(
        String moduleKey,
        Long id,
        String title,
        String detail,
        String status) {
}
