import { defer, firstValueFrom, from, retry } from "rxjs";

export function retryUntil<T>(promise: Promise<T>) {
	const observable = defer(() => from(promise).pipe(retry({ delay: 2000 })));
	return firstValueFrom(observable);
}
