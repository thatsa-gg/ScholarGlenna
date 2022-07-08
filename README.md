## Dev Notes
- You ***need*** to copy `config-sample.env` to `config.env` and initialize the variables to launch the dev container.

## components

- Web App

    Primary user-facing interface.
    - Can create/delete/manage teams, servers, and leagues.
    - Can select builds, build role compositions, and post compositions.
    - Can set preferences.
    - Can set away times.

- Discord Bot

    In-app management.

    - Can add/remove team members.
    - Can get user info.
    - Can set preferences.
    - can set away times.

- API

    Interfaces with Web App and Discord Bot to get/set info. Can do everything.

- Database

    Holds info.

## key points

- logs of moderator/owner actions
- if a user leaves a server, update teams/notify moderators
- Users (Discord User + GW2 Account Names or API Keys)

    Users can have one or more *Builds.
- Server (Discord Server)
    - Team (has users, name, optional channel, optional group)

        Server owners and moderators can manage teams.

        Team leaders can manage teams.
- League (optional Discord Server)
    - *Teams

        League owners and moderators can add and remove teams from the league.

        Teams must apply to join a league.
- Build (class, traits, gear, skills)

## things this should do

- commands:
    - build:
        - register: registers a new build
        - delete: remove a build
        - update: update a build
    - builds:
        - list [player = self]: list builds for a player
        - add [alias...]: add a build
        - remove [alias...]: remove a build
    - logs:
        - record [boss]: get record logs
        - get [player]: get your logs
        - team [team]: get team logs (only team leader and moderators can do this)
    - team:
        - create: create a new team
        - delete: delete a team
        - add <team> <player>: add a player to a team
        - remove <team> <player>: remove a player from a team
        - away: set date you will be away until (notifies builder that a fill is needed)
        - set:
            - time <time>: set static time (either timestamp or +/-hours from reset)
            - channel <channel>: set a team's Discord channel
            - role:
                - <role>:
                    - Leader (minimum rank for /logs team)
                    - Commander (minimum rank for /role)
                    - Member (default)
                    - Observer
                - grant <player> <role>: grants permissions to a player on a team
                - revoke <player> <role>: revokes permissions for a player on a team
    - mechanics:
        - register: registers a new mechanic
        - delete: delete a mechanic
        - add [alias...]: add mechanic knowledge tag
        - remove [alias...]: remove mechanic knowledge
    - role:
        - start [team]: start building a new role composition
            - needs to ask if preferences should be asked for
        - prefer [alias...]: set preferences
        - TODO: somehow let the team leader input the role composition
        - publish [team]: publish a role composition to the team chat
    - glenna:
        - permissions:
            - <role>:
                - Mentor
                - Moderator
            - set <role> <group>: set a group to be of a certain role
        - version: get the current version.
        - github: get the url to the repo

# Routes

- `/`: landing page, dashboard if signed in
- `/guild/[id]`: public guild info.
    - If guild is open and user is not a member, show guild invite link.
    - If signed in and can manage, show links for settings and show options
- `/teams/[id]`: public team info.
    - If a member of the guild, show invite options if open.
    - Otherwise (if invite options are open, and guild is open, show guild invite)
    - If signed in and can manage, show links for settings and roster, and show options
