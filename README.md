This extension removes the recently opened entries that no longer valid. Surprisingly such basic functionality is not yet provided out-of-box.

It specifically only targets local file-system entries. Other entry types such as "Virtual Workspace" and "SSH Remote" are ignored.

A new command "Sweep non-existent recently opened entries" is added, which is also exexcuted automatically upon startup.

### Notes about the fork

Forked from [vsc-recently-opened-cleaner](https://github.com/WissenIstNacht/vsc-recently-opened-cleaner). Originally deviates in the following aspects:

1. The original only operates on the workspaces and folders. This extension works on file entries as well.
2. The original provides the setting to execute the command at startup, and defaults to OFF. This extension makes the setting default to ON as an opinionated choice.

### Attribution

Extension icon: [Housework icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/housework)
