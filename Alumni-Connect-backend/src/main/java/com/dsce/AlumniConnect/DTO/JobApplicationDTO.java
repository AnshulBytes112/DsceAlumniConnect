package com.dsce.AlumniConnect.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobApplicationDTO {
    private String company;
    private String role;
    private String status;
    private String date;
}
