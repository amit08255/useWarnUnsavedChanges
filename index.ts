import SingletonRouter, { Router } from 'next/router';
import { useEffect } from 'react';

const defaultConfirmationDialog = async (msg) => window.confirm(msg);

type Options = {
    shouldPreventLeaving: boolean;
    message?: string;
    confirmationDialog?: (msg: string) => Promise<boolean>;
};

const useWarnUnsavedChanges = ({
    shouldPreventLeaving,
    message = 'Changes you made may not be saved.',
    confirmationDialog = defaultConfirmationDialog,
}:Options) => {
    useEffect(() => {
        const SingletonRouterObj:any = SingletonRouter;
        const RouterObj:any = Router;
        const windowObj:any = window;

        if (!SingletonRouterObj.router?.change) {
            return undefined;
        }

        const originalChangeFunction = SingletonRouterObj.router.change;
        const originalOnBeforeUnloadFunction = window.onbeforeunload;

        /*
         * Modifying the window.onbeforeunload event stops the browser tab/window from
         * being closed or refreshed. Since it is not possible to alter the close or reload
         * alert message, an empty string is passed to trigger the alert and avoid confusion
         * about the option to modify the message.
         */
        if (shouldPreventLeaving) {
            window.onbeforeunload = () => '';
        } else {
            window.onbeforeunload = originalOnBeforeUnloadFunction;
        }

        /*
         * Overriding the router.change function blocks Next.js route navigations
         * and disables the browser's back and forward buttons. This opens up the
         * possibility to use the window.confirm alert instead.
         */
        if (shouldPreventLeaving) {
            SingletonRouterObj.router.change = async (...args) => {
                const [historyMethod, , as] = args;
                const currentUrl = SingletonRouterObj.router?.state.asPath.split('?')[0];
                const changedUrl = as.split('?')[0];
                const hasNavigatedAwayFromPage = currentUrl !== changedUrl;
                const wasBackOrForwardBrowserButtonClicked = historyMethod === 'replaceState';
                let confirmed = false;

                if (hasNavigatedAwayFromPage) {
                    confirmed = await confirmationDialog(message);
                }

                if (confirmed) {
                    RouterObj.prototype.change.apply(SingletonRouter.router, args);
                } else if (wasBackOrForwardBrowserButtonClicked && hasNavigatedAwayFromPage) {
                    await SingletonRouter.router?.push(SingletonRouterObj.router?.state.asPath);

                    const browserDirection = 'back';

                    if (browserDirection === 'back') {
                        windowObj.history.go(1); // back button
                    } else {
                        windowObj.history.go(-1); // forward button
                    }
                }
            };
        }

        /*
         * When the component is unmounted, the original change function is assigned back.
         */
        return () => {
            SingletonRouterObj.router.change = originalChangeFunction;
            window.onbeforeunload = originalOnBeforeUnloadFunction;
        };
    }, [shouldPreventLeaving, message, confirmationDialog]);
};

export default useWarnUnsavedChanges;
