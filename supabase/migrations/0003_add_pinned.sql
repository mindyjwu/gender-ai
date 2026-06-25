alter table conversations add column pinned boolean default false;
create index idx_conversations_pinned on conversations(user_id, pinned);
