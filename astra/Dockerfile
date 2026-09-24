FROM php:8.4-cli

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    libgmp-dev \
    libzip-dev \
    unzip \
    git \
    && docker-php-ext-install pdo_pgsql pgsql bcmath gmp zip pcntl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-interaction --prefer-dist --optimize-autoloader

COPY . .
RUN composer dump-autoload --optimize

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
