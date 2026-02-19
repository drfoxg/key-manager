# Имя сервиса в docker-compose
SERVICE = gogpt-spa

# Запуск
up:
	docker compose up -d

up-build:
	docker compose up -d --build

down:
	docker compose down

restart:
	docker compose restart $(SERVICE)

# Логи
logs:
	docker compose logs -f $(SERVICE)

# Терминал контейнера
sh:
	docker compose exec $(SERVICE) sh

# npm команды
install:
	docker compose exec $(SERVICE) npm install

build:
	docker compose exec $(SERVICE) npm run build

lint:
	docker compose exec $(SERVICE) npm run lint

# Очистка
clean:
	docker compose down -v --remove-orphans

prune:
	docker image prune -f

# Статус
ps:
	docker compose ps

# Git
pull:
	git pull --rebase origin main

amend:
	git add . && git commit --amend --no-edit

push:
	git push origin main

force-push:
	git push --force origin main