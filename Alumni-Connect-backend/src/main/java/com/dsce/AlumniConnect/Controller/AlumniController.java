package com.dsce.AlumniConnect.Controller;

import com.dsce.AlumniConnect.Service.AlumniService;
import com.dsce.AlumniConnect.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
public class AlumniController {

    private final AlumniService alumniservice;

    @GetMapping("/alumni")
    public ResponseEntity<?> getAllAlumni() {
        // This is a placeholder implementation.
        // In a real application, you would fetch this data from the database.


        List<User> allAlum=alumniservice.getAllAlumni();
        if(allAlum.isEmpty()){
            log.info("No alumni found");
        }else {
            log.info("Alumni found: {}", allAlum.size());
        }
        return ResponseEntity.ok(allAlum);

    }
}
