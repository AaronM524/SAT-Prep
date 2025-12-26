-- Enable Row Level Security on all user-related tables

-- Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Practice tests RLS
ALTER TABLE practice_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own tests" ON practice_tests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tests" ON practice_tests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tests" ON practice_tests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tests" ON practice_tests FOR DELETE USING (auth.uid() = user_id);

-- Test questions RLS
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own test questions" ON test_questions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM practice_tests WHERE practice_tests.id = test_questions.test_id AND practice_tests.user_id = auth.uid()));
CREATE POLICY "Users can insert their own test questions" ON test_questions FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM practice_tests WHERE practice_tests.id = test_questions.test_id AND practice_tests.user_id = auth.uid()));
CREATE POLICY "Users can update their own test questions" ON test_questions FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM practice_tests WHERE practice_tests.id = test_questions.test_id AND practice_tests.user_id = auth.uid()));

-- User progress RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- Study plans RLS
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own plans" ON study_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own plans" ON study_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own plans" ON study_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own plans" ON study_plans FOR DELETE USING (auth.uid() = user_id);

-- Study sessions RLS
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own sessions" ON study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sessions" ON study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON study_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Public read access for categories, topics, and questions (everyone can see these)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT TO authenticated USING (true);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view topics" ON topics FOR SELECT TO authenticated USING (true);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view questions" ON questions FOR SELECT TO authenticated USING (true);
