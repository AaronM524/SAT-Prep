-- Seed initial categories
INSERT INTO categories (id, name, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Math', 'SAT Math section covering algebra, geometry, and data analysis'),
  ('22222222-2222-2222-2222-222222222222', 'Reading & Writing', 'SAT Reading and Writing section');

-- Seed topics for Math
INSERT INTO topics (category_id, name, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Algebra', 'Linear equations, inequalities, and functions'),
  ('11111111-1111-1111-1111-111111111111', 'Advanced Math', 'Quadratics, polynomials, and exponential functions'),
  ('11111111-1111-1111-1111-111111111111', 'Geometry & Trigonometry', 'Shapes, angles, and trigonometric concepts'),
  ('11111111-1111-1111-1111-111111111111', 'Problem Solving & Data Analysis', 'Statistics, ratios, and data interpretation');

-- Seed topics for Reading & Writing
INSERT INTO topics (category_id, name, description) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Reading Comprehension', 'Understanding and analyzing passages'),
  ('22222222-2222-2222-2222-222222222222', 'Grammar & Usage', 'Sentence structure and grammar rules'),
  ('22222222-2222-2222-2222-222222222222', 'Vocabulary in Context', 'Word meaning and usage'),
  ('22222222-2222-2222-2222-222222222222', 'Expression of Ideas', 'Rhetoric and synthesis');

-- Seed sample Math questions
INSERT INTO questions (category_id, topic_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) 
SELECT 
  '11111111-1111-1111-1111-111111111111',
  t.id,
  'If 3x + 7 = 22, what is the value of 6x + 14?',
  '30', '44', '58', '66',
  'B',
  'First solve for x: 3x + 7 = 22, so 3x = 15, x = 5. Then 6x + 14 = 6(5) + 14 = 30 + 14 = 44. Alternatively, notice that 6x + 14 = 2(3x + 7) = 2(22) = 44.',
  2
FROM topics t WHERE t.name = 'Algebra' LIMIT 1;

INSERT INTO questions (category_id, topic_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) 
SELECT 
  '11111111-1111-1111-1111-111111111111',
  t.id,
  'What is the solution to the equation 2(x - 3) = 4x + 2?',
  'x = -4', 'x = -2', 'x = 2', 'x = 4',
  'A',
  'Expand: 2x - 6 = 4x + 2. Subtract 2x from both sides: -6 = 2x + 2. Subtract 2: -8 = 2x. Divide by 2: x = -4.',
  2
FROM topics t WHERE t.name = 'Algebra' LIMIT 1;

INSERT INTO questions (category_id, topic_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) 
SELECT 
  '11111111-1111-1111-1111-111111111111',
  t.id,
  'If f(x) = x² - 4x + 3, what is f(5)?',
  '8', '12', '18', '28',
  'A',
  'Substitute x = 5: f(5) = 5² - 4(5) + 3 = 25 - 20 + 3 = 8.',
  3
FROM topics t WHERE t.name = 'Advanced Math' LIMIT 1;

INSERT INTO questions (category_id, topic_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) 
SELECT 
  '11111111-1111-1111-1111-111111111111',
  t.id,
  'What are the solutions to x² - 5x + 6 = 0?',
  'x = 1, x = 6', 'x = 2, x = 3', 'x = -2, x = -3', 'x = -1, x = 6',
  'B',
  'Factor the quadratic: (x - 2)(x - 3) = 0. So x = 2 or x = 3.',
  2
FROM topics t WHERE t.name = 'Advanced Math' LIMIT 1;

INSERT INTO questions (category_id, topic_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) 
SELECT 
  '11111111-1111-1111-1111-111111111111',
  t.id,
  'A circle has a radius of 5. What is its area?',
  '10π', '25π', '50π', '100π',
  'B',
  'Area of a circle = πr². With r = 5: A = π(5)² = 25π.',
  1
FROM topics t WHERE t.name = 'Geometry & Trigonometry' LIMIT 1;

INSERT INTO questions (category_id, topic_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) 
SELECT 
  '11111111-1111-1111-1111-111111111111',
  t.id,
  'In a right triangle, if one leg is 3 and the hypotenuse is 5, what is the other leg?',
  '2', '3', '4', '6',
  'C',
  'Using the Pythagorean theorem: a² + b² = c². So 3² + b² = 5². 9 + b² = 25. b² = 16. b = 4.',
  2
FROM topics t WHERE t.name = 'Geometry & Trigonometry' LIMIT 1;

INSERT INTO questions (category_id, topic_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) 
SELECT 
  '11111111-1111-1111-1111-111111111111',
  t.id,
  'The average of 5 numbers is 12. What is their sum?',
  '17', '48', '60', '72',
  'C',
  'Average = Sum / Count. So Sum = Average × Count = 12 × 5 = 60.',
  1
FROM topics t WHERE t.name = 'Problem Solving & Data Analysis' LIMIT 1;

INSERT INTO questions (category_id, topic_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) 
SELECT 
  '11111111-1111-1111-1111-111111111111',
  t.id,
  'If 30% of a number is 45, what is the number?',
  '100', '135', '150', '180',
  'C',
  '30% × n = 45. So n = 45 / 0.30 = 150.',
  2
FROM topics t WHERE t.name = 'Problem Solving & Data Analysis' LIMIT 1;

-- Seed sample Reading & Writing questions
INSERT INTO questions (category_id, topic_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) 
SELECT 
  '22222222-2222-2222-2222-222222222222',
  t.id,
  'The word "ubiquitous" most nearly means:',
  'rare', 'everywhere', 'ancient', 'mysterious',
  'B',
  'Ubiquitous means present, appearing, or found everywhere.',
  2
FROM topics t WHERE t.name = 'Vocabulary in Context' LIMIT 1;

INSERT INTO questions (category_id, topic_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) 
SELECT 
  '22222222-2222-2222-2222-222222222222',
  t.id,
  'Which sentence is grammatically correct?',
  'Him and me went to the store.', 'He and I went to the store.', 'Him and I went to the store.', 'Me and him went to the store.',
  'B',
  'When the pronouns are subjects of the sentence, use the subjective case: "He and I".',
  1
FROM topics t WHERE t.name = 'Grammar & Usage' LIMIT 1;
