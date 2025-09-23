import { Controller, Get, Post, Put, Body, Param, Query, Delete } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { PageBudget } from './schemas/pagebudget.schema';
import { PostBudget } from './schemas/postbudget.schema';

@Controller('budgets')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  // ===== PageBudget =====
  @Post('page')
  async createPageBudget(@Body() body: Partial<PageBudget>) {
    return this.budgetService.createPageBudget(body);
  }

  @Get('page')
  async getPageBudgets() {
    return this.budgetService.getPageBudgets();
  }

  @Put('page/:id')
  async updatePageBudget(@Param('id') id: string, @Body() body: Partial<PageBudget>) {
    return this.budgetService.updatePageBudget(id, body);
  }


  @Delete('page/:id')
  async deletePageBudget(@Param('id') id: string) {
    return this.budgetService.deletePageBudget(id);
  }
  
  // ===== PostBudget =====
  @Post('post')
  async createPostBudget(@Body() body: Partial<PostBudget>) {
    return this.budgetService.createPostBudget(body);
  }

  @Get('post')
  async getPostBudgets() {
    return this.budgetService.getPostBudgets();
  }

  @Put('post/:id')
  async updatePostBudget(@Param('id') id: string, @Body() body: Partial<PostBudget>) {
    return this.budgetService.updatePostBudget(id, body);
  }

  @Delete('post/:id')
  async deletePostBudget(@Param('id') id: string) {
    return this.budgetService.deletePostBudget(id);
  }

  // ===== Combinaison Page + Post =====
  @Get('page/:pageId/month/:month')
  async getBudgetsByPageAndMonth(
    @Param('pageId') pageId: string,
    @Param('month') month: string,
  ) {
    return this.budgetService.getBudgetsByPageAndMonth(pageId, month);
  }
}
