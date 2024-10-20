import {
  isValidEmail,
  isValidPassword,
  isValidRuleTitle,
  isValidTutorAbout,
  isValidTutorBio,
  isValidUserBirthYear,
  isValidUserName,
} from "@/verification";
import { FieldError } from "@litespace/types";

describe("email validation", () => {
  it("should accept these valid emails", () => {
    expect(isValidEmail("john@gmail.com")).toBe(true);
    expect(isValidEmail("john.doe@gmail.com")).toBe(true);
    expect(isValidEmail("john-doe@gmail.com")).toBe(true);
    expect(isValidEmail("john_doe@gmail.com")).toBe(true);
    expect(isValidEmail("6johndoe@gmail.com")).toBe(true);
    expect(isValidEmail("-johndoe@gmail.com")).toBe(true);
  });
  it("should reject email without @ character", () => {
    expect(isValidEmail("johngmail.com")).toBe(FieldError.InvalidEmail);
  });
  it("should reject email with unappropriate domain name", () => {
    expect(isValidEmail("john@gmail.c")).toBe(FieldError.InvalidEmail);
  });
  it("should reject email with double @", () => {
    expect(isValidEmail("j@ohn@gmail.com")).toBe(FieldError.InvalidEmail);
  });
  it("should reject email start with non word char", () => {
    expect(isValidEmail("#john@gmail.com")).toBe(FieldError.InvalidEmail);
  });
});

describe("validate password", () => {
  it("should accept these password with 8 or more characters, letters and numbers", () => {
    expect(isValidPassword("Abc12345678")).toBe(true);
    expect(isValidPassword("abcABC1234567890")).toBe(true);
  });
  it("should reject password less than 8 characters", () => {
    expect(isValidPassword("Ab1234")).toBe(FieldError.PasswordTooShort);
  });
  it("should reject password without any letter", () => {
    expect(isValidPassword("12345678")).toBe(FieldError.PasswordMissingLetters);
  });
  it("should reject password without any numbers", () => {
    expect(isValidPassword("Abcdefgh")).toBe(FieldError.PasswordMissingNumbers);
  });
});

describe("validate username", () => {
  it("should accept this username", () => {
    expect(isValidUserName("زيد محمد")).toBe(true);
  });
  it("should reject user name contains non arabic letters", () => {
    expect(isValidUserName("ed زيد")).toBe(FieldError.InvalidUserName);
  });
  it("should reject user name that contains numbers", () => {
    expect(isValidUserName("زيد 78")).toBe(FieldError.InvalidUserName);
  });
  it("should reject user name that contains symbols", () => {
    expect(isValidUserName("زيد_عمر")).toBe(FieldError.InvalidUserName);
  });
});

// // Tutor fields validations
describe("user birth year validation", () => {
  it("should accept user with age in range 10-60", () => {
    expect(isValidUserBirthYear(new Date().getFullYear() - 10)).toBe(true);
    expect(isValidUserBirthYear(new Date().getFullYear() - 30)).toBe(true);
    expect(isValidUserBirthYear(new Date().getFullYear() - 60)).toBe(true);
  });
  it("should reject user with age out of range 10-60", () => {
    expect(isValidUserBirthYear(new Date().getFullYear() - 9)).toBe(
      FieldError.TutorTooYoung
    );
    expect(isValidUserBirthYear(new Date().getFullYear() - 61)).toBe(
      FieldError.TutorTooOld
    );
  });
});

describe("tutor bio validation", () => {
  it("should accept bio in range 1-60 chars", () => {
    expect(
      isValidTutorBio(
        "<div><h1>John</h1><p>specialized tutor in personalized learning and growth.</p></div>"
      )
    ).toBe(true);
  });
  it("should reject bio less than 1 char", () => {
    expect(isValidTutorBio("")).toBe(FieldError.TutorBioEmpty);
  });
  it("should reject bio exceeding 60 chars", () => {
    expect(
      isValidTutorBio(
        "<div><h1>John doe</h1><p>Experienced tutor specialized in personalized learning and growth.</p></div>"
      )
    ).toBe(FieldError.TutorBioTooLong);
  });
});

describe("tutor about validation", () => {
  it("should accept about in range 1-1000 chars", () => {
    expect(
      isValidTutorAbout(
        "<div><h3>about john doe</h3><p>A tutor guides students, helps with learning, explains concepts simply, and improves understanding step by step.</p></div>"
      )
    ).toBe(true);
  });
  it("should reject empty tutor about", () => {
    expect(isValidTutorAbout("")).toBe(FieldError.TutorAboutEmpty);
  });
  it("should reject tutor about with more than 1000 letters", () => {
    expect(
      isValidTutorAbout(
        "A tutor plays a vital role in enhancing a student's learning experience by providing personalized guidance and support. Unlike a traditional classroom setting, where the teacher's attention is divided among many students, a tutor can focus on the individual needs of each learner. This allows for a customized approach that aligns with the student's learning style, pace, and specific challenges. Whether a student is struggling with a particular subject or simply seeking to improve their skills, a tutor adapts lessons to suit their abilities, offering step-by-step explanations and targeted practice.One of the most important aspects of tutoring is its ability to build confidence. Many students feel anxious or overwhelmed in large classroom environments, especially if they fall behind. A tutor creates a safe, non-judgmental space where students can ask questions freely and work through problems at their own speed. This personalized attention helps clarify difficult concepts and ensures that the student fully grasps the material before moving on to more complex topics.In addition to academic instruction, tutors help students develop essential skills such as time management, study techniques, and problem-solving. These skills are not only valuable for immediate academic success but also for future educational and professional pursuits. A tutor teaches students how to approach their work systematically, breaking down larger tasks into manageable steps, which leads to better productivity and less stress.Moreover, tutoring is beneficial for students of all ages. For younger learners, a tutor helps lay a strong foundation in critical subjects like reading and math. For older students, tutors offer specialized support in more advanced topics, such as science, mathematics, or languages. Tutoring can also be crucial for exam preparation, where tutors guide students through practice tests, review key concepts, and teach test-taking strategies, helping them feel more prepared and confident.In conclusion, tutors play a key role in enhancing a student's academic journey. They provide personalized, focused instruction that helps students overcome challenges, build confidence, and achieve their educational goals. Through consistent support, a tutor not only improves a student's grades but also fosters a lifelong love for learning."
      )
    ).toBe(FieldError.TutorAboutTooLong);
  });
});

describe("rule title validation", () => {
  it("should accept title in range 5-255 chars", () => {
    expect(isValidRuleTitle("Rule Title")).toBe(true);
  });
  it("should reject title less than 5 char", () => {
    expect(isValidRuleTitle("rule")).toBe(FieldError.RuleTitleTooShort);
  });
  it("should reject title exceeding 255 chars", () => {
    expect(
      isValidRuleTitle(
        "Rule Title with 101 characters, Rule Title with 101 characters, Rule Title with 101 characters,Rule Title with 101 characters,Rule Title with 101 characters,Rule Title with 101 characters,Rule Title with 101 characters,Rule Title with 101 characters,Rule Title with 101 characters,"
      )
    ).toBe(FieldError.RuleTitleTooLong);
  });
});
