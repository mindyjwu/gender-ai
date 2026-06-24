-- Enable pgvector for RAG embeddings
create extension if not exists vector with schema extensions;

-- Source chunks for RAG (linguistics research, articles, etc.)
create table source_chunks (
  id uuid primary key default gen_random_uuid(),
  source_title text not null,
  source_type text not null check (source_type in ('research', 'book', 'article', 'speech', 'interview', 'tweet')),
  author text,
  gender_perspective text check (gender_perspective in ('male', 'female', 'neutral')),
  content text not null,
  embedding vector(1536),
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Conversations (one per user session)
create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text default 'New conversation',
  total_picks int default 0,
  male_picks int default 0,
  female_picks int default 0,
  status text default 'active' check (status in ('active', 'completed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Messages: each turn has the user prompt + both AI responses + user's pick
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  turn_number int not null,
  user_prompt text not null,
  male_response text not null,
  female_response text not null,
  user_pick text check (user_pick in ('male', 'female', null)),
  pick_reason text,
  sources_used jsonb default '[]',
  created_at timestamptz default now()
);

-- Reports: generated analysis at end of conversation
create table reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null references conversations(id) on delete cascade,
  summary text not null,
  communication_style jsonb not null,
  personality_insights jsonb not null,
  pick_breakdown jsonb not null,
  comparison_chart jsonb not null,
  created_at timestamptz default now()
);

-- Indexes
create index idx_source_chunks_embedding on source_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index idx_conversations_user on conversations(user_id);
create index idx_messages_conversation on messages(conversation_id);
create index idx_reports_user on reports(user_id);
create index idx_reports_conversation on reports(conversation_id);

-- RLS policies
alter table conversations enable row level security;
alter table messages enable row level security;
alter table reports enable row level security;
alter table source_chunks enable row level security;

-- Users can only access their own conversations
create policy "Users read own conversations" on conversations for select using (auth.uid() = user_id);
create policy "Users insert own conversations" on conversations for insert with check (auth.uid() = user_id);
create policy "Users update own conversations" on conversations for update using (auth.uid() = user_id);

-- Messages: access via conversation ownership
create policy "Users read own messages" on messages for select using (
  exists (select 1 from conversations where conversations.id = messages.conversation_id and conversations.user_id = auth.uid())
);
create policy "Users insert own messages" on messages for insert with check (
  exists (select 1 from conversations where conversations.id = messages.conversation_id and conversations.user_id = auth.uid())
);
create policy "Users update own messages" on messages for update using (
  exists (select 1 from conversations where conversations.id = messages.conversation_id and conversations.user_id = auth.uid())
);

-- Reports
create policy "Users read own reports" on reports for select using (auth.uid() = user_id);
create policy "Users insert own reports" on reports for insert with check (auth.uid() = user_id);

-- Source chunks are readable by all authenticated users
create policy "Authenticated users read sources" on source_chunks for select using (auth.role() = 'authenticated');
