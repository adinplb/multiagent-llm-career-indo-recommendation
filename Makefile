.PHONY: git-hooks lint

# Instal hook pre-commit ke lokasi hooks yang dikelola Git.
git-hooks:
	@command -v pre-commit >/dev/null 2>&1 || { echo "❌ Pasang pre-commit terlebih dahulu: pip install pre-commit"; exit 1; }
	@echo "⚙️  Mengonfigurasi Git Hooks..."
	@hook_path="$$(git rev-parse --git-path hooks/pre-commit)"; \
	mkdir -p "$$(dirname "$$hook_path")"; \
	cp githooks/pre-commit "$$hook_path"; \
	chmod +x "$$hook_path"
	@echo "✅ Git Hooks berhasil dipasang di .git/hooks/"

# Pemeriksaan sintaks Python yang dipanggil oleh konfigurasi pre-commit.
lint:
	@echo "  Memeriksa syntax Python..."
	python -m compileall -q .
