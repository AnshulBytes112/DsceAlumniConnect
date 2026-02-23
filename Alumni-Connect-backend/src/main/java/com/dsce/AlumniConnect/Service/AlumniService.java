package com.dsce.AlumniConnect.Service;

import com.dsce.AlumniConnect.Repository.UserRepository;
import com.dsce.AlumniConnect.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AlumniService {
    @Autowired
    private UserRepository userRepository;

    public List<User> getAllAlumni() {
return userRepository.findAll();
    }
}
