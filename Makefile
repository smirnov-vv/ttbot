docker:
	docker build -t vvsmirnov/tt-saratov-bot .
	docker push vvsmirnov/tt-saratov-bot

compose:
	docker compose build
	docker compose push

ssh:
	ssh -t root@45.67.57.2 'cd ttbot_dev ; bash -l'
