/*
  Warnings:

  - A unique constraint covering the columns `[street,city,state,zipCode]` on the table `Property` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Property_street_city_state_zipCode_key" ON "Property"("street", "city", "state", "zipCode");
