package com.sponsorcrm.entity;
import jakarta.persistence.*; import jakarta.validation.constraints.*;
@Entity @Table(name="sponsor_benefits") public class Benefit {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @NotBlank private String type; @Column(length=1200) private String description;
 @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="sponsor_id",nullable=false) private Sponsor sponsor;
 @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="campaign_id") private Campaign campaign;
 private Integer targetValue; private Integer actualValue; private String status="PENDING";
 public Long getId(){return id;} public String getType(){return type;} public void setType(String v){type=v;} public String getDescription(){return description;} public void setDescription(String v){description=v;} public Sponsor getSponsor(){return sponsor;} public void setSponsor(Sponsor v){sponsor=v;} public Campaign getCampaign(){return campaign;} public void setCampaign(Campaign v){campaign=v;} public Integer getTargetValue(){return targetValue;} public void setTargetValue(Integer v){targetValue=v;} public Integer getActualValue(){return actualValue;} public void setActualValue(Integer v){actualValue=v;} public String getStatus(){return status;} public void setStatus(String v){status=v;}
}
