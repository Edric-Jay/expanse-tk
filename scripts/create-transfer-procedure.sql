-- Create a function to handle wallet transfers
CREATE OR REPLACE FUNCTION transfer_funds(
  p_from_wallet_id UUID,
  p_to_wallet_id UUID,
  p_amount NUMERIC,
  p_user_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Check if both wallets belong to the user
  IF NOT EXISTS (
    SELECT 1 FROM wallets 
    WHERE id = p_from_wallet_id AND user_id = p_user_id
  ) OR NOT EXISTS (
    SELECT 1 FROM wallets 
    WHERE id = p_to_wallet_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Invalid wallet selection';
  END IF;
  
  -- Check if source wallet has enough funds
  IF NOT EXISTS (
    SELECT 1 FROM wallets 
    WHERE id = p_from_wallet_id AND balance >= p_amount
  ) THEN
    RAISE EXCEPTION 'Insufficient funds in the source wallet';
  END IF;
  
  -- Update source wallet (subtract amount)
  UPDATE wallets
  SET balance = balance - p_amount,
      updated_at = NOW()
  WHERE id = p_from_wallet_id;
  
  -- Update destination wallet (add amount)
  UPDATE wallets
  SET balance = balance + p_amount,
      updated_at = NOW()
  WHERE id = p_to_wallet_id;
  
  -- Create a transfer transaction record
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    description,
    wallet_id,
    category_id,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    'transfer',
    p_amount,
    'Transfer between wallets',
    p_from_wallet_id,
    NULL,
    NOW(),
    NOW()
  );
END;
$$ LANGUAGE plpgsql;
