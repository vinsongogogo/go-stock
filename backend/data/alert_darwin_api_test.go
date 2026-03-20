//go:build darwin
// +build darwin

package data

import (
	"testing"
)

// @Date 2025/02/06 17:50
// @Desc macOS 通知测试 - toast 库仅支持 Windows，macOS 使用系统通知
// -----------------------------------------------------------------------------------

func TestAlert(t *testing.T) {
	// macOS 使用 osascript 或 terminal-notifier 实现通知
	// toast 库仅适用于 Windows 平台
	t.Skip("跳过: macOS 不支持 go-toast 库，请使用 NewAlertDarwinApi().Alert() 测试")
}
