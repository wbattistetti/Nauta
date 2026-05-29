/*
  # Create AI chat history table

  1. New Tables
    - `chat_messages`
      - `id` (uuid, primary key)
      - `role` (text) - 'user' or 'assistant'
      - `content` (text) - message content
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Allow all reads and inserts (this is a personal travel tool, no auth)
*/

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of chat messages"
  ON chat_messages FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert of chat messages"
  ON chat_messages FOR INSERT
  TO anon
  WITH CHECK (true);
