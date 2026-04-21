from auth import hash_password, verify_password, create_access_token, decode_access_token


password = "password123"
dict_data = {"sub": "1", "name": "テスト"}

def test_password():
  result = hash_password(password)
  assert result != password

def test_verify_password():
  hashed = hash_password(password)
  assert verify_password(password, hashed) == True
  assert verify_password("wrongpass", hashed) == False

def test_create_access_token():
  result = create_access_token(dict_data)
  assert type(result) == str
  assert result.count(".") == 2

def test_decode_access_token():
  org_dict = create_access_token(dict_data)
  result = decode_access_token(org_dict)
  non_result = decode_access_token("これは不正なトークン")
  assert result["sub"] == dict_data["sub"]
  assert non_result is None