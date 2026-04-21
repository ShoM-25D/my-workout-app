package main

import (
	"testing"
)

func TestParseUserID_valid(t *testing.T) {
	id, err := parseUserID("123")
	if id != 123 {
		t.Errorf("期待：123, 実際：%v", id)
	}
	if err != nil {
		t.Errorf("エラーが返ってきた：%v", err)
	}

}

func TestParseUserID_empty(t *testing.T) {
	id, err := parseUserID("")
	if id != 0 {
		t.Errorf("期待：0, 実際：%v", id)
	}
	if err == nil {
		t.Errorf("エラーが返ってきた：%v", err)
	}

}

func TestParseUserID_invalid(t *testing.T) {
	id, err := parseUserID("abc")
	if id != 0 {
		t.Errorf("期待：0, 実際：%v", id)
	}
	if err == nil {
		t.Errorf("エラーが返ってきた：%v", err)
	}

}
