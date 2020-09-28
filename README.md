## Garrett's Wisely Web Test

# Setup Steps

Unfortunately, the docker image seemed to be very unreliable for me. Instead, to run the application, you can perform the following

-   Run `docker-compose up db` to start the DB.
-   In the `api` directory, run `yarn dev` to start the development server for the backend. Be sure to export the `DATABASE_CONNECTION_STRING` variable.
-   In the `frontend` directory, run `yarn serve --port=3000`

This will launch all of the pieces needed to run the application. Once loaded, you'll be directed in the web app to create your first restaurant.
From there, you'll be able to create inventory for reservations, view this inventory, create reservations per inventory record, and finally view
the reservations you have created for each inventory record on a day by day basis.
