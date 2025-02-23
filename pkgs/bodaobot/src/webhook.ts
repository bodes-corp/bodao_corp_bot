export default class Webhook {
	api: URL;
	webhook: URL;

	constructor(token: string, request: Request) {
		this.api = new URL('https://api.telegram.org/bot' + token);
		this.webhook = new URL(new URL(request.url).origin + `/${token}`);
	}

	async set() {
		const url = new URL(`${this.api.origin}${this.api.pathname}/setWebhook`);
		const params = url.searchParams;
		params.append('url', this.webhook.toString());
		params.append('max_connections', '100');
		params.append('allowed_updates', JSON.stringify(['message', 'inline_query', 'business_message', 'business_connection']));
		params.append('drop_pending_updates', 'true');
		params.append('secret_token', '720617fsolq29cdjf3G3tT')
		return await fetch(`${url.toString()}?${params.toString()}`);
	}
}
