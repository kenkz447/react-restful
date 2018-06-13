export interface Environment {
    fetch(url: string, requestInit: RequestInit | null): Promise<Response>;
}

export function createEnvironment(params: Environment) {
    return params;
}