# Jobs

Jobs guidelines can be found [here](https://handbook.litespace.org/s/development/p/jobs-HPMEKgs91n).

# DB Backup Job

The database backup job probably will not start with default servers configs; therefor this section has been written to address such issue.

You can check manually if the backup function works or not, by executing this command:

```BASH
pnpm psql backup
```

In case it's working, you are ready to the start the jobs: `pnpm start`. However, if it's not, a permission denied error pops up, you may need to do the following:

1. Create `docker` group:

```BASH
sudo groupadd docker
```

2. Add user to the docker group:

```BASH
sudo usermod -aG docker $USER
```

3. Activate changes:

```BASH
newgrp docker
```

4. And finally, try the command again:

```BASH
pnpm psql backup
```
