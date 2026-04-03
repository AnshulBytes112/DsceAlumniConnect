# Enhanced Resume Parser

This enhanced resume parser addresses the limitations of the original keyword-based parser by implementing intelligent section detection, fuzzy matching, and content analysis.

## Key Improvements

### 1. **Intelligent Section Detection**
- **Fuzzy String Matching**: Uses Jaccard similarity to match similar section names
- **Pattern Recognition**: Regex patterns for common section heading formats
- **Contextual Analysis**: Analyzes section content to determine type
- **Confidence Scoring**: Provides confidence levels for section classification

### 2. **Multi-Strategy Section Classification**
- **Exact Keyword Matching**: Original approach for exact matches
- **Pattern-Based Matching**: Regex patterns for common formats
- **Content-Based Analysis**: Analyzes section content when names are unclear
- **Hybrid Approach**: Combines multiple strategies for best results

### 3. **Enhanced Format Support**
- **Pipe Format**: "Project Name | Tech Stack" (e.g., Anshul's resume)
- **Section Format**: "Project Name §" (e.g., Bharath's resume)
- **Bold+Size Format**: Bold headers with larger font size
- **Bold-Only Format**: Bold headers with same size as body
- **Fallback Format**: Blank-line based separation

### 4. **Universal Section Extraction**
- Handles unknown section types gracefully
- Extracts structured information from any section
- Provides fallback mechanisms for malformed data

## Architecture

### Core Components

1. **Enhanced Section Detector** (`enhanced-section-detector.ts`)
   - `detectSectionType()`: Classifies sections with confidence scores
   - `classifyAndReorganizeSections()`: Reorganizes sections based on content
   - `detectSectionsByContent()`: Content-based section detection

2. **Enhanced Get Section Lines** (`enhanced-get-section-lines.ts`)
   - `getSectionLinesByKeywordsEnhanced()`: Enhanced keyword matching
   - `getAllSectionsWithDetection()`: Returns sections with detection info
   - `getSectionLinesHybrid()`: Hybrid approach combining strategies

3. **Universal Extractor** (`universal-extractor.ts`)
   - `extractUniversalSection()`: Extracts from any section type
   - `extractAllSectionsUniversal()`: Processes all sections universally
   - `getSectionsByTypeWithFallback()`: Type-based extraction with fallback

### Section Detection Strategies

#### Work Experience Detection
- **Keywords**: work, experience, employment, history, job, professional, career, internship
- **Patterns**: /^work experience$/i, /^professional experience$/i, etc.
- **Context**: company, position, role, duration, responsibilities, achievements

#### Education Detection
- **Keywords**: education, academic, qualification, degree, university, college, school
- **Patterns**: /^education$/i, /^academic background$/i, etc.
- **Context**: university, college, degree, bachelor, master, phd, gpa, graduation

#### Project Detection
- **Keywords**: project, portfolio, work, development, research
- **Patterns**: /^projects$/i, /^personal projects$/i, etc.
- **Context**: built, developed, created, implemented, designed, technologies

#### Skills Detection
- **Keywords**: skill, technical, technology, expertise, competency, proficiency
- **Patterns**: /^skills$/i, /^technical skills$/i, etc.
- **Context**: programming, language, framework, library, tool, software

#### Profile Detection
- **Keywords**: profile, summary, objective, about, introduction, overview
- **Patterns**: /^professional summary$/i, /^career objective$/i, etc.
- **Context**: experienced, skilled, passionate, dedicated, professional

## Usage

### Basic Usage
```typescript
import { extractResumeFromSections } from './extract-resume-from-sections';

const resume = extractResumeFromSections(sections);
```

### Enhanced Section Detection
```typescript
import { classifyAndReorganizeSections } from './lib/enhanced-section-detector';

const enhancedSections = classifyAndReorganizeSections(sections);
```

### Universal Extraction
```typescript
import { extractAllSectionsUniversal } from './lib/universal-extractor';

const universalSections = extractAllSectionsUniversal(sections);
```

## Format-Specific Handling

### Pipe Format Projects
- Detects headers with "|" separator
- Extracts project name and tech stack separately
- Handles dates on separate lines

### Section Format Projects
- Detects "§" symbol as separator
- Strips separator from project names
- Maintains original structure

### Bold+Size Format
- Analyzes font size differences
- Identifies headers by size + bold combination
- Falls back to bold-only if needed

## Testing

The enhanced parser includes comprehensive tests covering:
- Standard resume formats
- Non-standard section names
- Pipe and section format projects
- Empty and malformed sections
- Confidence scoring accuracy

Run tests with:
```bash
npm test -- enhanced-parser.test.ts
```

## Migration from Original Parser

The enhanced parser is backward compatible. To upgrade:

1. Replace `getSectionLinesByKeywords` with `getSectionLinesByKeywordsEnhanced`
2. Add `classifyAndReorganizeSections` before extraction
3. Use `extractResumeFromSections` as before

## Performance Considerations

- **Memory**: Slightly increased due to additional analysis
- **Speed**: Minimal impact for most resumes
- **Accuracy**: Significant improvement in section detection
- **Robustness**: Better handling of edge cases and malformed data

## Future Enhancements

1. **Machine Learning**: ML-based section classification
2. **Internationalization**: Support for non-English resumes
3. **Custom Patterns**: User-defined section patterns
4. **Performance Optimization**: Caching and parallel processing
5. **Advanced Content Analysis**: NLP for better content understanding

## Troubleshooting

### Common Issues

1. **Low Confidence Detection**
   - Check section content for relevant keywords
   - Verify section naming patterns
   - Consider adding custom patterns

2. **Missing Sections**
   - Ensure sections have content
   - Check for unusual section names
   - Use universal extractor as fallback

3. **Format Mismatch**
   - Verify format detection is working
   - Check font size and bold properties
   - Use fallback extraction methods

### Debug Mode

Enable debug logging by setting:
```typescript
const DEBUG = true;
```

This will provide detailed information about section detection and classification decisions.
