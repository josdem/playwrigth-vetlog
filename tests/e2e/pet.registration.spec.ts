/*
Copyright 2024 Jose Morales contact@josdem.io

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { test, expect, Page } from "@playwright/test"
import { Authenticator } from "../utils/authenticator"
import { HomePage } from "../pages/home.page"
import { PetCreatePage } from "../pages/pet.create.page"
import { PetListPage } from "../pages/pet.list.page"
import { PetEditPage } from "../pages/pet.edit.page"
import { Constants } from "../properties/test.constants"
import data from "../properties/data.json"

test.describe.configure({ mode: "serial" })

let page: Page
let homePage: HomePage
let petListPage: PetListPage
let authenticator: Authenticator
const WAITING_TIME = 10000

test.beforeAll(async ({ browser }) => {
  test.info().annotations.push({
    type: "story",
    description: "https://github.com/josdem/vetlog-spring-boot/wiki/US1",
  })
  test.info().annotations.push({
    type: "story",
    description: "https://github.com/josdem/vetlog-spring-boot/wiki/US15",
  })
  test.info().annotations.push({
    type: "story",
    description: "https://github.com/josdem/vetlog-spring-boot/wiki/US7",
  })
  test.info().annotations.push({
    type: "time",
    description: `${new Date()}`,
  })
  page = await browser.newPage()
  homePage = new HomePage(page)
  petListPage = new PetListPage(page)
  authenticator = new Authenticator(page)
  authenticator.login(`${process.env.VETLOG_USERNAME}`, `${process.env.VETLOG_PASSWORD}`)
})

test("should registrer a pet", async () => {
  const petCreatePage = new PetCreatePage(page)
  await homePage.clickOnRegisterPet()
  await expect(page).toHaveTitle(data.petCreateTitle, { timeout: WAITING_TIME })
  await petCreatePage.fillPetData()
  await expect(petCreatePage.getMessage()).toBeVisible()
})

test("should validate pet details are visible in user's pet list", async () => {
  await page.goto(Constants.HOME_URL)
  await homePage.clickOnListPets()
  await expect(page).toHaveTitle(data.petListTitle)
  await expect(petListPage.getPetName().first()).toBeVisible()
  await expect(petListPage.getPetBreed().first()).toBeVisible()
  await expect(petListPage.getPetDewormed().first()).toBeVisible()
  await expect(petListPage.getPetSterilized().first()).toBeVisible()
  await expect(petListPage.getPetVaccinated().first()).toBeVisible()
})

test("should update a pet", async () => {
  const petEditPage = new PetEditPage(page)
  await petListPage.clickOnEditButton()
  await expect(page).toHaveTitle(data.petEditTitle, { timeout: WAITING_TIME })
  await petEditPage.changePetData()
  await expect(petEditPage.getMessage()).toBeVisible()
})

test("should delete a pet", async () => {
  await page.goto(Constants.HOME_URL)
  await homePage.clickOnListPets()
  await expect(page).toHaveTitle(data.petListTitle, { timeout: WAITING_TIME })
  await petListPage.clickOnDeleteButton()
  await petListPage.clickOnDeleteModal()
  await expect(petListPage.getMessage()).toBeVisible()
})
