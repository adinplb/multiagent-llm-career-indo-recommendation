  GNU nano 8.5                             Makefile                             Modified
.PHONY: git-hooks lint

# Perintah untuk menginstal / mendaftarkan git-hooks otomatis
git-hooks:
	@echo "⚙️  Mengonfigurasi Git Hooks..."
	@cp githooks/pre-commit .git/hooks/pre-commit
	@chmod +x .git/hooks/pre-commit
	@echo "✅ Git Hooks berhasil dipasang di .git/hooks/"

# Perintah pengecekan (linter) yang dipanggil oleh script pre-commit tadi
lint:
	@echo "  Memeriksa syntax Python..."
	@# Perintah di bawah ini akan mengecek apakah ada error syntax di file Python Anda
	python -m compileall -q .

