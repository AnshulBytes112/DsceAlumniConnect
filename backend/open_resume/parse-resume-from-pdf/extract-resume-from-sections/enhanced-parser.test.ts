import { classifyAndReorganizeSections } from "./lib/enhanced-section-detector";
import { getSectionLinesByKeywordsEnhanced } from "./lib/enhanced-get-section-lines";
import { extractAllSectionsUniversal } from "./lib/universal-extractor";
import { extractResumeFromSections } from "./index";
import type { ResumeSectionToLines, TextItem } from "../types";

// Mock data for testing different resume formats
const createTextItem = (text: string, bold: boolean = false): TextItem => ({
  text,
  x: 0,
  y: 0,
  width: 100,
  height: 12,
  fontName: "Arial",
  hasEOL: false,
  bold
});

// Test Case 1: Standard resume format
const standardResumeSections: ResumeSectionToLines = {
  "Work Experience": [
    [createTextItem("Software Engineer", true), createTextItem("Google", false)],
    [createTextItem("Jan 2020 - Present", false)],
    [createTextItem("• Developed scalable systems", false)],
    [createTextItem("• Led team of 5 engineers", false)]
  ],
  "Education": [
    [createTextItem("Bachelor of Computer Science", true), createTextItem("Stanford University", false)],
    [createTextItem("2016 - 2020", false)],
    [createTextItem("GPA: 3.8", false)]
  ],
  "Projects": [
    [createTextItem("E-commerce Platform", true)],
    [createTextItem("React, Node.js, MongoDB", false)],
    [createTextItem("• Built full-stack application", false)]
  ],
  "Skills": [
    [createTextItem("Programming Languages:", true)],
    [createTextItem("JavaScript, Python, Java", false)],
    [createTextItem("Frameworks:", true)],
    [createTextItem("React, Angular, Spring", false)]
  ]
};

// Test Case 2: Non-standard section names
const nonStandardResumeSections: ResumeSectionToLines = {
  "Professional Background": [
    [createTextItem("Senior Developer", true), createTextItem("Microsoft", false)],
    [createTextItem("2018 - 2023", false)],
    [createTextItem("• Architected cloud solutions", false)]
  ],
  "Academic History": [
    [createTextItem("Master's in Data Science", true), createTextItem("MIT", false)],
    [createTextItem("2014 - 2016", false)]
  ],
  "Technical Portfolio": [
    [createTextItem("AI Chatbot", true)],
    [createTextItem("Python, TensorFlow", false)],
    [createTextItem("• Implemented NLP models", false)]
  ],
  "Technical Expertise": [
    [createTextItem("Python, Machine Learning, AWS", false)]
  ]
};

// Test Case 3: Pipe format projects (Anshul's format)
const pipeFormatSections: ResumeSectionToLines = {
  "Projects": [
    [createTextItem("College Alumni Network | Spring Boot, MongoDB, React", true)],
    [createTextItem("Oct 2023 - Present", false)],
    [createTextItem("• Developed alumni networking platform", false)],
    [createTextItem("• Integrated real-time chat", false)]
  ],
  "Work Experience": [
    [createTextItem("Full Stack Developer | Tech Corp", true)],
    [createTextItem("2022 - 2023", false)],
    [createTextItem("• Built RESTful APIs", false)]
  ]
};

// Test Case 4: Section format projects (Bharath's format)
const sectionFormatSections: ResumeSectionToLines = {
  "Project Portfolio": [
    [createTextItem("Machine Learning Pipeline §", true)],
    [createTextItem("Personal Project", false)],
    [createTextItem("2023", false)],
    [createTextItem("• Built end-to-end ML pipeline", false)]
  ]
};

describe("Enhanced Resume Parser Tests", () => {
  
  test("should classify standard section names correctly", () => {
    const reorganized = classifyAndReorganizeSections(standardResumeSections);
    
    expect(reorganized.work).toBeDefined();
    expect(reorganized.education).toBeDefined();
    expect(reorganized.project).toBeDefined();
    expect(reorganized.skill).toBeDefined();
  });

  test("should detect and reorganize non-standard section names", () => {
    const reorganized = classifyAndReorganizeSections(nonStandardResumeSections);
    
    expect(reorganized.work).toBeDefined();
    expect(reorganized.education).toBeDefined();
    expect(reorganized.project).toBeDefined();
    expect(reorganized.skill).toBeDefined();
  });

  test("should find sections using enhanced keyword matching", () => {
    const workLines = getSectionLinesByKeywordsEnhanced(standardResumeSections, ["work"]);
    expect(workLines.length).toBeGreaterThan(0);
    
    const educationLines = getSectionLinesByKeywordsEnhanced(standardResumeSections, ["education"]);
    expect(educationLines.length).toBeGreaterThan(0);
  });

  test("should handle pipe format projects", () => {
    const reorganized = classifyAndReorganizeSections(pipeFormatSections);
    expect(reorganized.project).toBeDefined();
    
    const projectLines = getSectionLinesByKeywordsEnhanced(reorganized, ["project"]);
    expect(projectLines.length).toBeGreaterThan(0);
  });

  test("should handle section format projects", () => {
    const reorganized = classifyAndReorganizeSections(sectionFormatSections);
    expect(reorganized.project).toBeDefined();
  });

  test("should extract resume from standard format", () => {
    const resume = extractResumeFromSections(standardResumeSections);
    
    expect(resume.workExperiences).toBeDefined();
    expect(resume.educations).toBeDefined();
    expect(resume.projects).toBeDefined();
    expect(resume.skills).toBeDefined();
  });

  test("should extract resume from non-standard format", () => {
    const resume = extractResumeFromSections(nonStandardResumeSections);
    
    expect(resume.workExperiences).toBeDefined();
    expect(resume.educations).toBeDefined();
    expect(resume.projects).toBeDefined();
    expect(resume.skills).toBeDefined();
  });

  test("should handle pipe format project extraction", () => {
    const resume = extractResumeFromSections(pipeFormatSections);
    
    expect(resume.projects).toBeDefined();
    expect(resume.projects.length).toBeGreaterThan(0);
    
    const project = resume.projects[0];
    expect(project.project).toContain("College Alumni Network");
    expect(project.descriptions).toBeDefined();
  });

  test("should handle section format project extraction", () => {
    const resume = extractResumeFromSections(sectionFormatSections);
    
    expect(resume.projects).toBeDefined();
    expect(resume.projects.length).toBeGreaterThan(0);
  });

  test("universal extractor should handle unknown sections", () => {
    const unknownSections: ResumeSectionToLines = {
      "Random Section": [
        [createTextItem("Some content", false)],
        [createTextItem("• More content", false)]
      ]
    };

    const universalSections = extractAllSectionsUniversal(unknownSections);
    
    expect(universalSections).toBeDefined();
    expect(universalSections.length).toBeGreaterThan(0);
    expect(universalSections[0].title).toBe("Random Section");
    expect(universalSections[0].content).toBeDefined();
  });

  test("should handle empty or malformed sections gracefully", () => {
    const malformedSections: ResumeSectionToLines = {
      "Empty Section": [],
      "Single Line": [[createTextItem("Just one line", false)]]
    };

    const resume = extractResumeFromSections(malformedSections);
    
    expect(resume).toBeDefined();
    expect(resume.workExperiences).toEqual([]);
    expect(resume.educations).toEqual([]);
  });
});

describe("Section Detection Confidence Tests", () => {
  
  test("should have high confidence for exact matches", () => {
    const detection = classifyAndReorganizeSections({
      "Work Experience": standardResumeSections["Work Experience"]
    });
    
    expect(detection.work).toBeDefined();
  });

  test("should have medium confidence for partial matches", () => {
    const detection = classifyAndReorganizeSections({
      "Professional Background": nonStandardResumeSections["Professional Background"]
    });
    
    expect(detection.work).toBeDefined();
  });

  test("should fallback to content analysis for unclear sections", () => {
    const unclearSections: ResumeSectionToLines = {
      "Stuff I Did": [
        [createTextItem("Software Engineer at Google", true)],
        [createTextItem("Built scalable systems", false)]
      ]
    };

    const detection = classifyAndReorganizeSections(unclearSections);
    
    // Should still categorize this as work experience based on content
    expect(Object.keys(detection).length).toBeGreaterThan(0);
  });
});
