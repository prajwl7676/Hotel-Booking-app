import test, { expect } from "@playwright/test";

const UI_URL="http://localhost:5173/";

test.beforeEach(async({page})=>{
      await page.goto(UI_URL);
    
      await page.getByRole('link', {name:'Sign In'}).click();
    
      await expect(page.getByRole('link', {name:'Sign In'})).toBeVisible();
    
      await page.locator("[name=email]").fill("test@gmail.com");
    
      await page.locator("[name=password]").fill("password@123");
    
      await page.getByRole("button", {name:"Sign In"}).click();
      
      await expect(page.getByText("Sign In Successfull")).toBeVisible();
})

test("should allow user to add hotel",async({page})=>{
    await page.goto(`${UI_URL}/add-hotel`);
    await page.locator("[name=name]").fill("Test Hotel");
    await page.locator("[name=city]").fill("Test city");
    await page.locator("[name=country]").fill("Test country");
    await page.locator("[name=description]").fill("Test description for test hotel");
    await page.locator("[name=pricePerNight]").fill("100");
})