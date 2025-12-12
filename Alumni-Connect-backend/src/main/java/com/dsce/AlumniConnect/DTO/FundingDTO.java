package com.dsce.AlumniConnect.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FundingDTO {
    private String title;
    private String amount;
    private String status;
    private String date;
}
