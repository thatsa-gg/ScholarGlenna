/// <reference types="@sveltejs/kit" />
/// <reference types="@glenna/common" />

declare namespace App {
}

// hack to get FontAwesome playing nicely
declare module '@fortawesome/free-brands-svg-icons/index.es' {
    export * from '@fortawesome/free-brands-svg-icons'
}
