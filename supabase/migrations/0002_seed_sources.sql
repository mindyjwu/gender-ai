-- Seed linguistics research as source chunks for RAG
-- These are well-documented communication pattern differences from published research

-- Deborah Tannen — "You Just Don't Understand" (1990)
insert into source_chunks (source_title, source_type, author, gender_perspective, content) values
('You Just Don''t Understand', 'book', 'Deborah Tannen', 'neutral',
'Women use "rapport talk" — conversation as a way to establish connections and negotiate relationships. The emphasis is on displaying similarities and matching experiences. Men use "report talk" — conversation as a way to preserve independence and negotiate status. The emphasis is on exhibiting knowledge and skill.'),

('You Just Don''t Understand', 'book', 'Deborah Tannen', 'female',
'Women tend to ask more questions in conversation, not because they lack knowledge, but to maintain conversational flow and show engagement. They use questions like "What do you think?" and "How did that make you feel?" to invite participation and signal that they value the other person''s perspective.'),

('You Just Don''t Understand', 'book', 'Deborah Tannen', 'male',
'Men are more likely to offer solutions when someone presents a problem, viewing the conversation as an opportunity to demonstrate competence and help. This "fix-it" approach comes from a framework where status is negotiated by showing knowledge and capability.'),

('You Just Don''t Understand', 'book', 'Deborah Tannen', 'female',
'Women often engage in "troubles talk" — sharing problems as a way to connect and receive empathy. The goal is not to receive solutions but to feel heard and understood. Responding with "I know exactly what you mean" or sharing a similar experience is the expected response pattern.'),

('You Just Don''t Understand', 'book', 'Deborah Tannen', 'male',
'Men tend to be more comfortable with silence in conversation and less likely to use backchannel responses like "mm-hmm," "right," and "yeah." They are more likely to take longer turns at speaking and hold the floor with extended narratives or explanations.'),

-- Carol Gilligan — "In a Different Voice" (1982)
('In a Different Voice', 'book', 'Carol Gilligan', 'female',
'Women tend to frame moral decisions in terms of relationships and care — "How will this affect the people involved?" Their communication often reflects an ethic of care, considering context, relationships, and the web of connections between people.'),

('In a Different Voice', 'book', 'Carol Gilligan', 'male',
'Men tend to frame decisions in terms of rules, rights, and justice — "What is the fair thing to do?" Their communication often reflects an ethic of justice, appealing to abstract principles, hierarchies, and individual rights.'),

-- John Gray — communication pattern observations
('Men Are from Mars, Women Are from Venus', 'book', 'John Gray', 'male',
'Men process stress by withdrawing and thinking internally — the "cave" metaphor. In communication, this manifests as shorter responses, a preference for processing before speaking, and needing space before discussing emotional topics. They tend to compartmentalize issues.'),

('Men Are from Mars, Women Are from Venus', 'book', 'John Gray', 'female',
'Women process stress by talking through issues — verbalizing helps organize thoughts and release tension. In communication, this manifests as longer, more detailed responses, thinking out loud, and connecting current issues to broader patterns and relationships.'),

-- Sociolinguistics research
('Language and Gender', 'research', 'Penelope Eckert & Sally McConnell-Ginet', 'neutral',
'Research shows women use more hedging language ("I think," "maybe," "sort of") not from uncertainty but as a politeness strategy that invites collaboration. Men tend to make more direct assertions and use fewer hedges, which signals confidence and authority.'),

('Language and Gender', 'research', 'Penelope Eckert & Sally McConnell-Ginet', 'female',
'Women are more likely to use inclusive language ("we," "us," "let''s") and to frame suggestions as questions ("What if we tried...?" "Don''t you think...?"). This collaborative framing invites participation rather than directing action.'),

('Language and Gender', 'research', 'Penelope Eckert & Sally McConnell-Ginet', 'male',
'Men are more likely to use declarative statements, imperative forms, and direct language. "Here''s what you should do" rather than "Have you considered...?" This direct style is efficient but can be perceived as dismissive of others'' input.'),

-- Robin Lakoff — "Language and Woman's Place" (1975)
('Language and Woman''s Place', 'research', 'Robin Lakoff', 'female',
'Women are more likely to use intensifiers ("so," "very," "really") and expressive adjectives ("wonderful," "adorable," "gorgeous") in conversation. They also use more emotional vocabulary and are more specific in describing emotional states.'),

('Language and Woman''s Place', 'research', 'Robin Lakoff', 'male',
'Men tend to use more technical vocabulary, more precise quantifiers, and fewer emotional descriptors. Their language tends toward the concrete and specific when discussing objects or processes, but less specific when discussing emotions or relationships.'),

-- Conversation analysis research
('Turn-taking in conversation', 'research', 'Zimmerman & West', 'neutral',
'In mixed-gender conversations, research found that men are responsible for 96% of interruptions. Men tend to interrupt to redirect the topic or assert dominance, while women''s overlapping speech tends to be supportive — finishing sentences, showing agreement.'),

('Apologies and responsibility', 'research', 'Janet Holmes', 'female',
'Women apologize more frequently than men, but not because they make more mistakes. Women use apologies as a social lubricant — "Sorry, but could you..." or "I''m sorry, I disagree." These are not admissions of fault but conversational strategies for maintaining harmony.'),

('Apologies and responsibility', 'research', 'Janet Holmes', 'male',
'Men reserve apologies for situations where they perceive genuine fault. They are less likely to use apologetic language in everyday conversation and may interpret others'' frequent apologies as a sign of weakness or uncertainty rather than politeness.'),

-- Compliments and feedback
('Compliment behavior', 'research', 'Janet Holmes', 'female',
'Women give and receive compliments more frequently, using them as solidarity-building tools. They compliment appearance, personality, and achievements equally. Their feedback style tends to wrap criticism in positive framing — "This is great, and one thing that could make it even better..."'),

('Compliment behavior', 'research', 'Janet Holmes', 'male',
'Men give fewer compliments overall and are more likely to compliment achievements and skills than appearance or personality. Their feedback style is more direct — stating what needs to change without extensive positive framing. This is perceived as efficient rather than harsh.'),

-- Storytelling patterns
('Narrative styles', 'research', 'Barbara Johnstone', 'female',
'Women''s narratives tend to be collaborative, featuring community, relationships, and shared experiences. They describe how events affected multiple people and use dialogue to recreate scenes. Stories often emphasize connection and mutual understanding.'),

('Narrative styles', 'research', 'Barbara Johnstone', 'male',
'Men''s narratives tend to feature individual action, contest, and achievement. They focus on what happened and what they did about it, with less dialogue and more action sequences. Stories often emphasize competence, independence, and overcoming obstacles.');
